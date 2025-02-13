using Npgsql;
using Microsoft.AspNetCore.Http.HttpResults;
namespace Server;

public static class TicketRoutes
{
    public record Ticket(
        int ticket_id,
        DateTime? ticket_time,
        string message,
        string answers,
        int questions_id,
        string status,
        int user_id,
        int category_id
    );


    /////////////////////////
    ///Våran DTOs grabbar!!!!
    /////////////////////////

    public record PostTicketDTO(
        DateTime ticket_time,
        string message,
        string answers,
        int questions_id,
        string status,
        int user_id,
        int category_id
    );

    public record UpdateStatusDTO(string Status);

    /////////////////////////
    ///TheEnd!!!!!!!!!!!!!!!!
    /////////////////////////

    public static async Task<List<Ticket>> GetTickets(NpgsqlDataSource db)
    {
        List<Ticket> result = new();
        using var query = db.CreateCommand("SELECT ticket_id, ticket_time, message, answers, questions_id, status, user_id, category_id FROM ticket");
        using var reader = await query.ExecuteReaderAsync();

        while (await reader.ReadAsync())
        {
            result.Add(new(
                reader.GetInt32(0),
                reader.GetFieldValue<DateTime>(1),
                reader.GetString(2),
                reader.GetString(3),
                reader.GetInt32(4),
                reader.GetString(5),
                reader.GetInt32(6),
                reader.GetInt32(7)
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
        command.Parameters.AddWithValue("message", ticketDto.message);
        command.Parameters.AddWithValue("answers", ticketDto.answers);
        command.Parameters.AddWithValue("questions", ticketDto.questions_id);
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
                    reader.GetString(3),
                    reader.GetInt32(4),
                    reader.GetString(5),
                    reader.GetInt32(6),
                    reader.GetInt32(7)
                );
                return TypedResults.Created($"/api/tickets/{ticket.ticket_id}", ticket);
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
}
