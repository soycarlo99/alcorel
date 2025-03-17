using Npgsql;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Server;

public static class QuestionRoutes
{

    public record Question(
        int id,
        string questions,
        int category_id
    );


    public record QuestionDTO(
        int id,
        string questions,
        int category_id
    );

    public record PostQuestionDTO(
        string questions,
        int category_id
    );


    public record DeleteQuestionDTO(
        int category_id
    );

    public static async Task<List<QuestionDTO>> GetQuestion(int category_id, NpgsqlDataSource db, HttpContext ctx)
    {
        int? companyId = ctx.Session.GetInt32("companyId");
        int? role = ctx.Session.GetInt32("role");
        if (companyId == null || role == 1 || role == 2)
        {
            return new List<QuestionDTO>();
        }

        List<QuestionDTO> result = new();
        using var query = db.CreateCommand(@"
            SELECT q.id, q.questions, q.category_id 
            FROM questions q
            JOIN categories c ON q.category_id = c.id
            WHERE q.category_id = @category_id AND c.company_id = @companyId");

        query.Parameters.AddWithValue("category_id", category_id);
        query.Parameters.AddWithValue("companyId", companyId);
        using var reader = await query.ExecuteReaderAsync();

        while (await reader.ReadAsync())
        {
            result.Add(new(
                reader.GetInt32(0),
                reader.GetString(1),
                reader.GetInt32(2)
            ));
        }

        return result;
    }

    public static async Task<Results<Created<Question>, BadRequest<string>>>
        PostQuestions(PostQuestionDTO PostQuestionDTO, NpgsqlDataSource db, HttpContext ctx)
    {
        int? companyId = ctx.Session.GetInt32("companyId");
        int? role = ctx.Session.GetInt32("role");
        if (companyId == null || role == 1 || role == 2)
        {
            return TypedResults.BadRequest("Unauthorized access");
        }

        using var checkCmd = db.CreateCommand("SELECT company_id FROM categories WHERE id = @categoryId");
        checkCmd.Parameters.AddWithValue("categoryId", PostQuestionDTO.category_id);
        var categoryCompanyId = await checkCmd.ExecuteScalarAsync();

        if (categoryCompanyId == null || (int)categoryCompanyId != companyId)
        {
            return TypedResults.BadRequest("Category not found or not authorized");
        }

        using var command = db.CreateCommand(@"
            INSERT INTO questions (questions, category_id) 
            VALUES (@questions, @category_id) 
            RETURNING id, questions, category_id");

        command.Parameters.AddWithValue("questions", PostQuestionDTO.questions);
        command.Parameters.AddWithValue("category_id", PostQuestionDTO.category_id);

        try
        {
            using var reader = await command.ExecuteReaderAsync();
            if (await reader.ReadAsync())
            {
                var question = new Question(
                    reader.GetInt32(0),
                    reader.GetString(1),
                    reader.GetInt32(2)
                );
                return TypedResults.Created($"/api/questions/{question.id}", question);
            }
            return TypedResults.BadRequest("Failed to add questions");
        }
        catch (PostgresException ex)
        {
            return TypedResults.BadRequest($"Database error: {ex.Message}");
        }
    }

    public static async Task<Results<Ok<string>, BadRequest<string>>>
    DeleteQuestion(int id, NpgsqlDataSource db)
    {
        using var command = db.CreateCommand("DELETE from questions where id = $1");

        command.Parameters.AddWithValue(id);

        try
        {
            var rowsAffected = await command.ExecuteNonQueryAsync();

            if (rowsAffected > 0)
            {
                return TypedResults.Ok($"Deleted {rowsAffected} question(s) successfully");
            }
            else
            {
                return TypedResults.Ok("No question deleted");
            }
        }
        catch (PostgresException ex)
        {
            return TypedResults.BadRequest($"Database error: {ex.Message}");
        }
    }

    public record UpdateQuestionDTO(string question);
    public static async Task<Results<Ok<string>, BadRequest<string>>>
    UpdateQuestion(int questionId, UpdateQuestionDTO questionDto, NpgsqlDataSource db)
    {
        string newQuestion = questionDto.question;
        using var command = db.CreateCommand(@"
            UPDATE questions
            SET questions = @newQuestion
            WHERE id = @id
            RETURNING id, questions");
        command.Parameters.AddWithValue("newQuestion", questionDto.question);
        command.Parameters.AddWithValue("id", questionId);
        
        try
        {
            using var reader = await command.ExecuteReaderAsync();
            if (await reader.ReadAsync())
            {
                return TypedResults.Ok($"Question updated for #{reader.GetInt32(0)}");
            }
            return TypedResults.BadRequest("Failed to update question");
        }
        catch (PostgresException ex)
        {
            return TypedResults.BadRequest($"Database error: {ex.Message}");
        }
    }
}
