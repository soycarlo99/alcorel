using Npgsql;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
namespace Server;

public static class CategoryRoutes
{
    public record Category(
        int id,
        string category_name,
        int company_id
    );


    /////////////////////////
    ///Våran DTOs grabbar!!!!
    /////////////////////////

    public record PostCategoryDTO(
        int id,
        string category_name,
        int company_id
    );

    public record DeleteCategoryDTO(
        int id,
        string category_name,
        int company_id
    );

    /////////////////////////
    ///TheEnd!!!!!!!!!!!!!!!!
    /////////////////////////

    public static async Task<List<Category>> GetCategories(NpgsqlDataSource db)
    {
        List<Category> result = new();
        using var query = db.CreateCommand("SELECT id, category_name, company_id FROM categories");
        using var reader = await query.ExecuteReaderAsync();
        
        while(await reader.ReadAsync())
        {
            result.Add(new(
                reader.GetInt32(0),
                reader.GetString(1),
                reader.GetInt32(2)
            ));
        }
        return result;
    }

    public static async Task<Results<Created<Category>, BadRequest<string>>> 
        PostCategory(PostCategoryDTO categoryDto, NpgsqlDataSource db)
    {
        using var command = db.CreateCommand(@"
            INSERT INTO categories (id, category_name, company_id) 
            VALUES (@id, @category_name, @company_id) 
            RETURNING id, category_name, company_id");
        
        command.Parameters.AddWithValue("id", categoryDto.id);
        command.Parameters.AddWithValue("category_name", categoryDto.category_name);
        command.Parameters.AddWithValue("company_id", categoryDto.company_id);
        try
        {
            using var reader = await command.ExecuteReaderAsync();
            if (await reader.ReadAsync())
            {
                var category = new Category(
                    reader.GetInt32(0),
                reader.GetString(1),
                reader.GetInt32(2)
                );
                return TypedResults.Created($"/api/categories/{categoryDto.id}", category);
            }
            return TypedResults.BadRequest("Failed to create category");
        }
        catch (PostgresException ex)
        {
            return TypedResults.BadRequest($"Database error: {ex.Message}");
        }
    }

public record CategoryidDTO(int categoryId);
    public static async Task<Results<Ok<string>, BadRequest<string>>>
    RemoveCategory([FromRoute]int categoryId,[FromBody] DeleteCategoryDTO DeleteDTO, NpgsqlDataSource db)
    {
        using var command = db.CreateCommand(@"
            DELETE FROM categories WHERE id = @selected_category");
        
        command.Parameters.AddWithValue("selected_category", categoryId);

        try
        {
            using var reader = await command.ExecuteReaderAsync();
            if (await reader.ReadAsync())
            {
                return TypedResults.Ok($"Category removed");
            }
            return TypedResults.BadRequest("Failed to remove category");
        }
        catch (PostgresException ex)
        {
            return TypedResults.BadRequest($"Database error: {ex.Message}");
        }
    }
}
