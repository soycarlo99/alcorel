using Microsoft.AspNetCore.Http.HttpResults;
using Npgsql;

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

    public record PostTicketDTO(DateTime ticket_time, string status, int user_id, int category_id);

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
        string Email,
        List<TicketMessage> Messages,
        List<QuestionAnswer> QuestionAnswers
    );

    public record TicketMessage(string Message, DateTime Timestamp);

    public record QuestionAnswer(int qid, string Question, string? Answer, int CategoryId);

    /////////////////////////
    ///TheEnd!!!!!!!!!!!!!!!!
    /////////////////////////
    public static string GenerateToken()
    {
        return Guid.NewGuid().ToString("N");
    }

    public static async Task<List<Ticket>> GetTickets(NpgsqlDataSource db)
    {
        List<Ticket> result = new();
        using var query = db.CreateCommand(
            "SELECT id, ticket_time, status, user_id, category_id FROM ticket"
        );
        using var reader = await query.ExecuteReaderAsync();

        while (await reader.ReadAsync())
        {
            result.Add(
                new(
                    reader.GetInt32(0),
                    reader.GetFieldValue<DateTime>(1),
                    reader.GetString(2),
                    reader.GetInt32(3),
                    reader.GetInt32(4)
                )
            );
        }
        return result;
    }

    public static async Task<Results<Created<Ticket>, BadRequest<string>>> PostTicket(
        PostTicketDTO ticketDto,
        NpgsqlDataSource db,
        HttpContext ctx
    )
    {
        string token = GenerateToken();

        using var command = db.CreateCommand(
            @"
            INSERT INTO ticket (ticket_time, status, user_id, category_id, access_token) 
            VALUES (@time, @status, @user_id, @category_id, @token) 
            RETURNING id, ticket_time, status, user_id, category_id"
        );

        command.Parameters.AddWithValue("time", ticketDto.ticket_time);
        command.Parameters.AddWithValue("status", ticketDto.status);
        command.Parameters.AddWithValue("user_id", ticketDto.user_id);
        command.Parameters.AddWithValue("category_id", ticketDto.category_id);
        command.Parameters.AddWithValue("token", token);
        int? companyId = ctx.Session.GetInt32("companyId");
        int? role = ctx.Session.GetInt32("role");
        if (companyId == null || role == 2)
        {
            Console.WriteLine("NOOO");
            return TypedResults.BadRequest(
                "Unauthorized, You are a employee and cant create a ticket"
            );
        }

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
                return TypedResults.Created($"/customer-view/{token}", ticket);
            }
            return TypedResults.BadRequest("Failed to create ticket");
        }
        catch (PostgresException ex)
        {
            return TypedResults.BadRequest($"Database error: {ex.Message}");
        }
    }

    public static async Task<Results<Ok<FullTicketDetails>, NotFound>> GetTicketByToken(
        string token,
        NpgsqlDataSource db,
        HttpContext ctx
    )
    {
        var ticketQuery =
            @"
            SELECT t.id, t.ticket_time, t.status, c.category_name, u.name, u.email
            FROM ticket t
            JOIN categories c ON t.category_id = c.id
            JOIN testuser u ON t.user_id = u.id
            WHERE t.access_token = @token";

        using var ticketCmd = db.CreateCommand(ticketQuery);
        ticketCmd.Parameters.AddWithValue("token", token);
        using var ticketReader = await ticketCmd.ExecuteReaderAsync();

        if (!await ticketReader.ReadAsync())
            return TypedResults.NotFound();

        var email = ticketReader.GetString(5);
        ctx.Session.SetString("customerEmail", email);

        var ticketId = ticketReader.GetInt32(0);
        var ticket = new
        {
            Id = ticketId,
            TicketTime = ticketReader.GetDateTime(1),
            Status = ticketReader.GetString(2),
            CategoryName = ticketReader.GetString(3),
            UserName = ticketReader.GetString(4),
            Email = email,
        };

        var messages = new List<TicketMessage>();
        using var messagesCmd = db.CreateCommand(
            "SELECT message, timestamp FROM ticket_messages WHERE ticket_id = @id ORDER BY timestamp"
        );
        messagesCmd.Parameters.AddWithValue("id", ticketId);
        using var messagesReader = await messagesCmd.ExecuteReaderAsync();
        while (await messagesReader.ReadAsync())
        {
            messages.Add(
                new TicketMessage(messagesReader.GetString(0), messagesReader.GetDateTime(1))
            );
        }

        var questionAnswers = new List<QuestionAnswer>();
        using var qaCmd = db.CreateCommand(
            @"
            SELECT q.id, q.questions, txa.answer, c.id AS category_id
            FROM ticket t
            JOIN categories c ON t.category_id = c.id
            JOIN questions q ON q.category_id = c.id
            LEFT JOIN ticketxquestion txa ON txa.question_id = q.id AND txa.ticket_id = t.id
            WHERE t.id = @id
        "
        );
        qaCmd.Parameters.AddWithValue("id", ticketId);
        using var qaReader = await qaCmd.ExecuteReaderAsync();
        while (await qaReader.ReadAsync())
        {
            questionAnswers.Add(
                new QuestionAnswer(
                    qaReader.GetInt32(0),
                    qaReader.GetString(1),
                    qaReader.IsDBNull(2) ? null : qaReader.GetString(2),
                    qaReader.GetInt32(3)
                )
            );
        }

        var fullDetails = new FullTicketDetails(
            ticket.Id,
            ticket.TicketTime,
            ticket.Status,
            ticket.CategoryName,
            ticket.UserName,
            ticket.Email,
            messages,
            questionAnswers
        );

        return TypedResults.Ok(fullDetails);
    }

    public static async Task<Results<Ok<string>, BadRequest<string>>> UpdateTicketStatus(
        int ticketId,
        UpdateStatusDTO statusDto,
        NpgsqlDataSource db
    )
    {
        string newStatus = statusDto.Status;

        using var command = db.CreateCommand(
            @"
            UPDATE ticket
            SET status = @status
            WHERE id = @ticket_id
            RETURNING id, status"
        );

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

    public static async Task<List<DetailedTicket>> GetDetailedTickets(
        NpgsqlDataSource db,
        HttpContext ctx
    )
    {
        int? companyId = ctx.Session.GetInt32("companyId");
        if (companyId == null)
        {
            return new List<DetailedTicket>();
        }

        List<DetailedTicket> result = new();
        string query =
            @"
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
            result.Add(
                new DetailedTicket(
                    reader.GetInt32(0),
                    reader.GetFieldValue<DateTime>(1),
                    reader.GetString(2),
                    reader.GetString(3),
                    reader.GetString(4),
                    "",
                    null,
                    "",
                    ""
                )
            );
        }
        return result;
    }

    public static async Task<Results<Ok<FullTicketDetails>, NotFound>> GetTicketById(
        int id,
        NpgsqlDataSource db
    )
    {
        var ticketQuery =
            @"
            SELECT t.id, t.ticket_time, t.status, c.category_name, u.name, u.email
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
            UserName = ticketReader.GetString(4),
            Email = ticketReader.GetString(5),
        };

        var messages = new List<TicketMessage>();
        using var messagesCmd = db.CreateCommand(
            "SELECT message, timestamp FROM ticket_messages WHERE ticket_id = @id ORDER BY timestamp"
        );
        messagesCmd.Parameters.AddWithValue("id", id);
        using var messagesReader = await messagesCmd.ExecuteReaderAsync();
        while (await messagesReader.ReadAsync())
        {
            messages.Add(
                new TicketMessage(messagesReader.GetString(0), messagesReader.GetDateTime(1))
            );
        }

        var questionAnswers = new List<QuestionAnswer>();
        using var qaCmd = db.CreateCommand(
            @"
            SELECT q.id, q.questions, txa.answer, c.id AS category_id
            FROM ticket t
            JOIN categories c ON t.category_id = c.id
            JOIN questions q ON q.category_id = c.id
            LEFT JOIN ticketxquestion txa ON txa.question_id = q.id AND txa.ticket_id = t.id
            WHERE t.id = @id
        "
        );
        qaCmd.Parameters.AddWithValue("id", id);
        using var qaReader = await qaCmd.ExecuteReaderAsync();
        while (await qaReader.ReadAsync())
        {
            questionAnswers.Add(
                new QuestionAnswer(
                    qaReader.GetInt32(0),
                    qaReader.GetString(1),
                    qaReader.IsDBNull(2) ? null : qaReader.GetString(2),
                    qaReader.GetInt32(3)
                )
            );
        }

        var fullDetails = new FullTicketDetails(
            ticket.Id,
            ticket.TicketTime,
            ticket.Status,
            ticket.CategoryName,
            ticket.UserName,
            ticket.Email,
            messages,
            questionAnswers
        );

        return TypedResults.Ok(fullDetails);
    }

    public static async Task<
        Results<Ok<string>, BadRequest<string>, NotFound<string>, UnauthorizedHttpResult>
    > RemoveTicket(int ticket_id, NpgsqlDataSource db, HttpContext ctx)
    {
        int? companyId = ctx.Session.GetInt32("companyId");
        int? role = ctx.Session.GetInt32("role");
        if (companyId == null || role == 1 || role == 2)
        {
            return TypedResults.Unauthorized();
        }

        using var command = db.CreateCommand(@"DELETE FROM ticket WHERE id = @selected_ticket");

        command.Parameters.AddWithValue("selected_ticket", ticket_id);

        try
        {
            var rowsAffected = await command.ExecuteNonQueryAsync();

            if (rowsAffected > 0)
            {
                return TypedResults.Ok($"Deleted {rowsAffected} ticket successfully");
            }
            else
            {
                return TypedResults.NotFound("The ticket doesn't exist");
            }
        }
        catch (PostgresException ex)
        {
            return TypedResults.BadRequest($"Database error: {ex.Message}");
        }
    }
}
