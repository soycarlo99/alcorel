using Npgsql;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Server;

public static class QuestionRoutes
{
    public record QuestionDTO(
        int id,
        string questions,
        int category_id
    );

    public static async Task<List<QuestionDTO>> GetQuestion(int category_id, NpgsqlDataSource db)
    {
        List<QuestionDTO> result = new();
        using var query = db.CreateCommand("SELECT id, questions, category_id FROM questions WHERE category_id = @category_id");
        query.Parameters.AddWithValue("category_id", category_id);
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
}
