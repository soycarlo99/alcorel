using Npgsql;
using Microsoft.AspNetCore.Http.HttpResults;
namespace Server;

public static class TicketRoutes
{

    public record Ticket(
        int id,
        DateTime? ticket_time,
        string status,
        int user_id,
        int category_id
    );


    /////////////////////////
    ///Våran DTOs grabbar!!!!
    /////////////////////////

    public record PostTicketDTO(
        DateTime ticket_time,
        string status,
        int user_id,
        int category_id
    );


    public record DetailedTicket(
        int ticketId,
        DateTime TicketTime,
        string Status,
        string CategoryName,
        string UserName,
        string Message,
        DateTime? MessageTimestamp,
        string Answer,
        string AnswerQuestion
    );


    public record UpdateStatusDTO(string Status);

    public record FullTicketViewDTO(
      int ticketId,
      DateTime TicketTime,
      string Status,
      string CategoryName,
      string UserName
      // List <messages> Messages,
      // List <QuestionAnswer> QuestionAnswer
      );

    /////////////////////////
    ///TheEnd!!!!!!!!!!!!!!!!
    /////////////////////////

    public static async Task<List<Ticket>> GetTickets(NpgsqlDataSource db)
    {
        List<Ticket> result = new();
        using var query = db.CreateCommand("SELECT id, ticket_time, status, user_id, category_id FROM ticket");
        using var reader = await query.ExecuteReaderAsync();

        while (await reader.ReadAsync())
        {
            result.Add(new(
                reader.GetInt32(0),
                reader.GetFieldValue<DateTime>(1),
                reader.GetString(2),
                reader.GetInt32(3),
                reader.GetInt32(4)
            ));
        }
        return result;
    }

    public static async Task<Results<Created<Ticket>, BadRequest<string>>>
        PostTicket(PostTicketDTO ticketDto, NpgsqlDataSource db)
    {
        using var command = db.CreateCommand(@"
            INSERT INTO ticket (ticket_time, message, answers, questions_id, status, user_id, category_id) 
            VALUES (@time, @message, @answers, @questions, @status, @user_id, @category_id) 
            RETURNING ticket_id, ticket_time, message, answers, questions_id, status, user_id, category_id");

        command.Parameters.AddWithValue("time", ticketDto.ticket_time);
        command.Parameters.AddWithValue("status", ticketDto.status);
        command.Parameters.AddWithValue("user_id", ticketDto.user_id);
        command.Parameters.AddWithValue("category_id", ticketDto.category_id);

        try
        {
            using var reader = await command.ExecuteReaderAsync();
            if (await reader.ReadAsync())
            {
                var ticket = new Ticket(
                    reader.GetInt32(0),
                    reader.GetFieldValue<DateTime>(1),
                    reader.GetString(2),
                    reader.GetInt32(3),
                    reader.GetInt32(4)
                );
                return TypedResults.Created($"/api/tickets/{ticket.id}", ticket);
            }
            return TypedResults.BadRequest("Failed to create ticket");
        }
        catch (PostgresException ex)
        {
            return TypedResults.BadRequest($"Database error: {ex.Message}");
        }
    }


    public static async Task<Results<Ok<string>, BadRequest<string>>>
    UpdateTicketStatus(int ticketId, UpdateStatusDTO statusDto, NpgsqlDataSource db)
    {
        string newStatus = statusDto.Status;

        using var command = db.CreateCommand(@"
            UPDATE ticket
            SET status = @status
            WHERE ticket_id = @ticket_id
            RETURNING ticket_id, status");

        command.Parameters.AddWithValue("status", newStatus);
        command.Parameters.AddWithValue("id", ticketId);

        try
        {
            using var reader = await command.ExecuteReaderAsync();
            if (await reader.ReadAsync())
            {
                return TypedResults.Ok($"Status updated for ticket {reader.GetInt32(0)}");
            }
            return TypedResults.BadRequest("Failed to update ticket status");
        }
        catch (PostgresException ex)
        {
            return TypedResults.BadRequest($"Database error: {ex.Message}");
        }
    }

    public static async Task<List<DetailedTicket>> GetDetailedTickets(NpgsqlDataSource db)
    {
        List<DetailedTicket> result = new();
        string query = @"
            SELECT
                t.id AS ticket_id,
                t.ticket_time,
                t.status,
                c.category_name,
                u.name AS user_name,
                tm.message,
                tm.timestamp AS message_timestamp,
                tqa.answer,
                q.questions AS answer_question
            FROM
                Ticket t
                    JOIN
                Categories c ON t.category_id = c.id
                    JOIN
                testuser u ON t.user_id = u.id
                    LEFT JOIN
                ticket_messages tm ON t.id = tm.ticket_id
                    LEFT JOIN
                TicketXQuestion tqa ON t.id = tqa.ticket_id
                    LEFT JOIN
                questions q ON tqa.question_id = q.id
            ORDER BY
                tm.timestamp ASC,
                tqa.question_id ASC;";

        using var command = db.CreateCommand(query);
        using var reader = await command.ExecuteReaderAsync();

      while (await reader.ReadAsync())
        {
            string message = reader.IsDBNull(5) ? "No messages" : reader.GetString(5);
            string answer = reader.IsDBNull(7) ? "No answer provided" : reader.GetString(7);
            string answerQuestion = reader.IsDBNull(8) ? "No question provided" : reader.GetString(8);

            result.Add(new DetailedTicket(
                reader.GetInt32(0),
                reader.GetFieldValue<DateTime>(1),
                reader.GetString(2),
                reader.GetString(3),
                reader.GetString(4),
                message,
                reader.IsDBNull(6) ? (DateTime?)null : reader.GetFieldValue<DateTime>(6),
                answer,
                answerQuestion
            ));
        }
        return result;
    }


    public static async Task<List<FullTicketViewDTO>> GetTicketbyId(int id, NpgsqlDataSource db){

        List<FullTicketViewDTO> result = new();
      var ticketQuery = @"

      SELECT
          t.id AS ticket_id,
          t.ticket_time,
          t.status,
          c.category_name,
          u.name AS user_name
          FROM ticket t 
          JOIN Categories c ON t.category_id = c.id 
          JOIN testuser u ON user_id = u.id 
          WHERE t.id = @id
          ";

      using var command = db.CreateCommand(ticketQuery);
      command.Parameters.AddWithValue("id", id);
      using var reader = await command.ExecuteReaderAsync();


      while(await reader.ReadAsync())

            {
              result.Add(new FullTicketViewDTO(
              reader.GetInt32(0),
              reader.GetFieldValue<DateTime>(1),
              reader.GetString(2),
              reader.GetString(3),
              reader.GetString(4)
              ));
            }

      return result;
    }

}
