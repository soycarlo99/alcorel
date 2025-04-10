using Microsoft.AspNetCore.Http.HttpResults;
using Npgsql;

namespace Server;

public static class CategoryRoutes
{
    public record Category(int id, string category_name, int company_id);

    public record PostCategoryDTO(int id, string category_name, int company_id);

    public record DeleteCategoryDTO(int id);

    public record GetCategoriesDTO(int id, string category_name, int company_id);

    public static async Task<List<GetCategoriesDTO>> GetCategories(
        NpgsqlDataSource db,
        HttpContext ctx
    )
    {
        int? companyId = ctx.Session.GetInt32("companyId");
        int? role = ctx.Session.GetInt32("role");
        if (companyId == null)
        {
            return new List<GetCategoriesDTO>();
        }

        List<GetCategoriesDTO> result = new();
        using var query = db.CreateCommand(
            "SELECT id, category_name, company_id FROM categories WHERE company_id = @companyId"
        );
        query.Parameters.AddWithValue("companyId", companyId);
        using var reader = await query.ExecuteReaderAsync();

        while (await reader.ReadAsync())
        {
            result.Add(new(reader.GetInt32(0), reader.GetString(1), reader.GetInt32(2)));
        }
        return result;
    }

    public record GetCategoriesByIdDTO(int id, string category_name, int company_id);

    public static async Task<List<GetCategoriesDTO>> GetCategoriesById(
        int categoryId,
        NpgsqlDataSource db
    )
    {
        List<GetCategoriesDTO> result = new();
        using var query = db.CreateCommand(
            "SELECT id, category_name, company_id FROM categories WHERE id = $1"
        );

        query.Parameters.AddWithValue(categoryId);
        using var reader = await query.ExecuteReaderAsync();

        while (await reader.ReadAsync())
        {
            result.Add(new(reader.GetInt32(0), reader.GetString(1), reader.GetInt32(2)));
        }
        return result;
    }

    public static async Task<Results<Created<Category>, BadRequest<string>>> PostCategory(
        PostCategoryDTO categoryDto,
        NpgsqlDataSource db,
        HttpContext ctx
    )
    {
        int? companyId = ctx.Session.GetInt32("companyId");
        int? role = ctx.Session.GetInt32("role");
        if (companyId == null || role == 1 || role == 2)
        {
            return TypedResults.BadRequest("Unauthorized or invalid company ID");
        }

        using var command = db.CreateCommand(
            @"
            INSERT INTO categories (category_name, company_id) 
            VALUES (@category_name, @company_id) 
            RETURNING id, category_name, company_id"
        );

        command.Parameters.AddWithValue("category_name", categoryDto.category_name);
        command.Parameters.AddWithValue("company_id", companyId);
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
                return TypedResults.Created($"/api/categories/{category.id}", category);
            }
            return TypedResults.BadRequest("Failed to create category");
        }
        catch (PostgresException ex)
        {
            return TypedResults.BadRequest($"Database error: {ex.Message}");
        }
    }

    public static async Task<Results<Ok<string>, BadRequest<string>>> RemoveCategory(
        int categoryId,
        NpgsqlDataSource db
    )
    {
        using var command = db.CreateCommand(
            @"DELETE FROM categories WHERE id = @selected_category"
        );

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

    public record UpdateCatDTO(string Cat);

    public static async Task<Results<Ok<string>, BadRequest<string>>> UpdateCategories(
        int catId,
        UpdateCatDTO CatDto,
        NpgsqlDataSource db
    )
    {
        string newCat = CatDto.Cat;

        using var command = db.CreateCommand(
            @"
            UPDATE categories
            SET category_name = @newCat
            WHERE id = @id
            RETURNING id, category_name"
        );

        command.Parameters.AddWithValue("newCat", CatDto.Cat);
        command.Parameters.AddWithValue("id", catId);

        try
        {
            using var reader = await command.ExecuteReaderAsync();
            if (await reader.ReadAsync())
            {
                return TypedResults.Ok($"category updated for  #{reader.GetInt32(0)}");
            }
            return TypedResults.BadRequest("Failed to update category");
        }
        catch (PostgresException ex)
        {
            return TypedResults.BadRequest($"Database error: {ex.Message}");
        }
    }
}
