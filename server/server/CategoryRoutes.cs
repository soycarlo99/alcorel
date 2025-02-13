using Npgsql;
using Microsoft.AspNetCore.Http.HttpResults;
namespace Server;

public static class CategoryRoutes
{
    public record Category(
        int category_id,
        string category_name,
        int company_id
    );


    /////////////////////////
    ///Våran DTOs grabbar!!!!
    /////////////////////////

    public record PostCategoryDTO(
        int category_id,
        string category_name,
        int company_id
    );

    public record DeleteCategoryDTO(
        int category_id,
        string category_name,
        int company_id
    );

    /////////////////////////
    ///TheEnd!!!!!!!!!!!!!!!!
    /////////////////////////

    public static async Task<List<Category>> GetCategories(NpgsqlDataSource db)
    {
        List<Category> result = new();
        using var query = db.CreateCommand("SELECT * FROM categories");
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
            INSERT INTO categories (category_id, category_name, company_id) 
            VALUES (@id, @category_name, @company_id) 
            RETURNING category_id, category_name, company_id");
        
        command.Parameters.AddWithValue("id", categoryDto.category_id);
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
                return TypedResults.Created($"/api/categories/{category.category_id}", category);
            }
            return TypedResults.BadRequest("Failed to create category");
        }
        catch (PostgresException ex)
        {
            return TypedResults.BadRequest($"Database error: {ex.Message}");
        }
    }


    public static async Task<Results<Ok<string>, BadRequest<string>>>
    RemoveCategory(int categoryId, DeleteCategoryDTO DeleteDTO, NpgsqlDataSource db)
    {
        
        using var command = db.CreateCommand(@"
            DELETE FROM categories WHERE category_id = @selected_category");
        
        command.Parameters.AddWithValue("selected_category", selectedCategory);

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
