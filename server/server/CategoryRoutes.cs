using Npgsql;
using Microsoft.AspNetCore.Http.HttpResults;
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
        int id
    );

    /////////////////////////
    ///TheEnd!!!!!!!!!!!!!!!!
    /////////////////////////

    public record GetCategoriesDTO(int id, string category_name, int company_id);
    public static async Task<List<GetCategoriesDTO>> GetCategories(NpgsqlDataSource db)
    {
        List<GetCategoriesDTO> result = new();
        using var query = db.CreateCommand("SELECT id, category_name, company_id FROM categories"); //WHERE company_id = @company_id
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
            RETURNING id, category_name, company_id");   //WHERE company_id = @company_id
        
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


    public static async Task<Results<Ok<string>, BadRequest<string>>>
    RemoveCategory(int categoryId, NpgsqlDataSource db)
    {
        using var command = db.CreateCommand(@"DELETE FROM categories WHERE id = @selected_category");  //WHERE company_id = @company_id
        
        command.Parameters.AddWithValue("selected_category", categoryId);

        try
        {
            var rowsAffected = await command.ExecuteNonQueryAsync();

            if (rowsAffected > 0)
            {
                return TypedResults.Ok($"Deleted {rowsAffected} category successfully");
            }
            else
            {
                return TypedResults.Ok("No categories deleted");
            }
        }
        catch (PostgresException ex)
        {
            return TypedResults.BadRequest($"Database error: {ex.Message}");
        }
    }
}
