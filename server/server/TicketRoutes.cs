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

    public record FullTicketDetails(
        int TicketId,
        DateTime TicketTime,
        string Status,
        string CategoryName,
        string UserName,
        List<TicketMessage> Messages,
        List<QuestionAnswer> QuestionAnswers
    );

    public record TicketMessage(
        string Message,
        DateTime Timestamp
    );

    public record QuestionAnswer(
        int qid,
        string Question,
        string? Answer,
        int CategoryId
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
            WHERE id = @ticket_id
            RETURNING id, status");

        command.Parameters.AddWithValue("status", newStatus);
        command.Parameters.AddWithValue("ticket_id", ticketId);

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

    public static async Task<List<DetailedTicket>> GetDetailedTickets(NpgsqlDataSource db, HttpContext ctx)
    {
        int? companyId = ctx.Session.GetInt32("companyId");
        if (companyId == null){
          return new List<DetailedTicket>();
        }

        List<DetailedTicket> result = new();
        string query = @"
            SELECT
                t.id AS ticket_id,
                t.ticket_time,
                t.status,
                c.category_name,
                u.name AS user_name
            FROM
                Ticket t
                    JOIN
                Categories c ON t.category_id = c.id
                    JOIN
                testuser u ON t.user_id = u.id
            WHERE
                u.company_id = @companyId
            ORDER BY t.ticket_time DESC;";

        using var command = db.CreateCommand(query);
        command.Parameters.AddWithValue("companyId", companyId);
        using var reader = await command.ExecuteReaderAsync();

        while (await reader.ReadAsync())
        {
            result.Add(new DetailedTicket(
                reader.GetInt32(0), 
                reader.GetFieldValue<DateTime>(1),
                reader.GetString(2),
                reader.GetString(3),
                reader.GetString(4),
                "", 
                null,
                "", 
                "" 
            ));
        }
        return result;
    }


    public static async Task<Results<Ok<FullTicketDetails>, NotFound>> GetTicketById(int id, NpgsqlDataSource db)
    {
        var ticketQuery = @"
            SELECT t.id, t.ticket_time, t.status, c.category_name, u.name 
            FROM ticket t
            JOIN categories c ON t.category_id = c.id
            JOIN testuser u ON t.user_id = u.id
            WHERE t.id = @id";
        
        using var ticketCmd = db.CreateCommand(ticketQuery);
        ticketCmd.Parameters.AddWithValue("id", id);
        using var ticketReader = await ticketCmd.ExecuteReaderAsync();
        
        if (!await ticketReader.ReadAsync())
            return TypedResults.NotFound();

        var ticket = new 
        {
            Id = ticketReader.GetInt32(0),
            TicketTime = ticketReader.GetDateTime(1),
            Status = ticketReader.GetString(2),
            CategoryName = ticketReader.GetString(3),
            UserName = ticketReader.GetString(4)
        };

        var messages = new List<TicketMessage>();
        using var messagesCmd = db.CreateCommand(
            "SELECT message, timestamp FROM ticket_messages WHERE ticket_id = @id ORDER BY timestamp"
        );
        messagesCmd.Parameters.AddWithValue("id", id);
        using var messagesReader = await messagesCmd.ExecuteReaderAsync();
        while (await messagesReader.ReadAsync())
        {
            messages.Add(new TicketMessage(
                messagesReader.GetString(0),
                messagesReader.GetDateTime(1)
            ));
        }

        var questionAnswers = new List<QuestionAnswer>();
        using var qaCmd = db.CreateCommand(@"
            SELECT q.id, q.questions, txa.answer, c.id AS category_id
            FROM ticket t
            JOIN categories c ON t.category_id = c.id
            JOIN questions q ON q.category_id = c.id
            LEFT JOIN ticketxquestion txa ON txa.question_id = q.id AND txa.ticket_id = t.id
            WHERE t.id = @id
        ");
        qaCmd.Parameters.AddWithValue("id", id);
        using var qaReader = await qaCmd.ExecuteReaderAsync();
        while (await qaReader.ReadAsync())
        {
            questionAnswers.Add(new QuestionAnswer(
                qaReader.GetInt32(0),  
                qaReader.GetString(1), 
                qaReader.IsDBNull(2) ? null : qaReader.GetString(2), 
                qaReader.GetInt32(3) 
            ));
        }

        var fullDetails = new FullTicketDetails(
            ticket.Id,
            ticket.TicketTime,
            ticket.Status,
            ticket.CategoryName,
            ticket.UserName,
            messages,
            questionAnswers
        );

        return TypedResults.Ok(fullDetails);
  }

}
