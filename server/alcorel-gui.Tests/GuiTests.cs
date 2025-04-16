using System.Text.RegularExpressions;
using Microsoft.Playwright;
using Microsoft.Playwright.MSTest;

namespace PlaywrightTests;

[TestClass]
public class GuiTest : PageTest
{
    private IPlaywright _playwright;
    private IBrowser _browser;
    private IBrowserContext _browserContext;
    private IPage _page;
    private IPage Page1;
    private IPage Page2;

    [TestInitialize]
    public async Task Setup()
    {
        _playwright = await Microsoft.Playwright.Playwright.CreateAsync();
        _browser = await _playwright.Chromium.LaunchAsync(
            new BrowserTypeLaunchOptions { Headless = true, SlowMo = 0 }
        );
        _browserContext = await _browser.NewContextAsync();
        _page = await _browserContext.NewPageAsync();
    }

    [TestCleanup]
    public async Task Cleanup()
    {
        await _browserContext.CloseAsync();
        await _browser.CloseAsync();
        _playwright.Dispose();
    }

    public async Task GivenIAmOnPage(string url)
    {
        await _page.GotoAsync(url);
    }

    public async Task WhenIClickLink(string linkName)
    {
        await _page.GetByRole(AriaRole.Link, new() { Name = linkName }).ClickAsync();
    }

    public async Task WhenIClickButton(string buttonName)
    {
        await _page.GetByRole(AriaRole.Button, new() { Name = buttonName }).ClickAsync();
    }

    public async Task WhenIFillTextbox(string name, string value)
    {
        await _page.GetByRole(AriaRole.Textbox, new() { Name = name }).ClickAsync();
        await _page.GetByRole(AriaRole.Textbox, new() { Name = name }).FillAsync(value);
    }

    public async Task WhenIFillTextboxAndTab(string name, string value)
    {
        await _page.GetByRole(AriaRole.Textbox, new() { Name = name }).FillAsync(value);
        await _page.GetByRole(AriaRole.Textbox, new() { Name = name }).PressAsync("Tab");
    }

    public async Task WhenISelectDropdownOption(string selector, string optionValue)
    {
        await _page.Locator(selector).SelectOptionAsync(new[] { optionValue });
    }

    public async Task WhenISelectDropdownOptionByIndex(string selector, int index)
    {
        await _page
            .Locator(selector)
            .SelectOptionAsync(new SelectOptionValue[] { new SelectOptionValue { Index = index } });
    }

    public async Task WhenISelectDropdownOptionByLabel(string label, string optionLabel)
    {
        await _page.GetByLabel(label).PressAsync("ArrowDown");
        await _page
            .GetByLabel(label)
            .SelectOptionAsync(new SelectOptionValue { Label = optionLabel });
    }

    public async Task GivenIAmLoggedInAsCompany(string email, string password)
    {
        await GivenIAmOnPage("http://localhost:5001/");
        await WhenIClickLink("log-in for businesses");
        await WhenIFillTextbox("Email", email);
        await WhenIFillTextbox("Password", password);
        await WhenIClickButton("Login");
    }

    public async Task WhenIRegisterCompany(
        string companyName,
        string orgNumber,
        string adminName,
        string email,
        string password
    )
    {
        await WhenIFillTextbox("Company Name", companyName);
        await WhenIFillTextbox("Organization Number", orgNumber);
        await WhenIFillTextbox("Admin Name", adminName);
        await WhenIFillTextbox("Email", email);
        await WhenIFillTextbox("Password", password);
    }

    public async Task WhenIAddCategory(string categoryName)
    {
        await WhenIFillTextbox("Please enter new category", categoryName);
        await WhenIClickButton("ADD");
    }

    public async Task WhenIEditCategory(int index, string newName)
    {
        await _page.GetByRole(AriaRole.Button, new() { Name = "✎" }).Nth(index).ClickAsync();
        await _page.Locator("input[name=\"Cat\"]").ClickAsync();
        await _page.Locator("input[name=\"Cat\"]").FillAsync(newName);
        await WhenIClickButton("✓");
    }

    public async Task WhenIDeleteCategory(int index)
    {
        await _page.GetByRole(AriaRole.Button, new() { Name = "-" }).Nth(index).ClickAsync();
    }

    public async Task WhenIAddQuestion(string questionText, string categoryId)
    {
        await _page.GetByPlaceholder("New question").FillAsync(questionText);
        await WhenISelectDropdownOption("select[name=\"category_id\"]", categoryId);
        await WhenIClickButton("Add Question");
    }

    public async Task WhenIEditQuestion(int index, string newText)
    {
        await _page.GetByRole(AriaRole.Button, new() { Name = "✎" }).Nth(index).ClickAsync();
        await _page.Locator("input[name=\"question\"]").FillAsync(newText);
        await WhenIClickButton("✓");
    }

    public async Task WhenIDeleteQuestion(int index)
    {
        await _page.GetByRole(AriaRole.Button, new() { Name = "-" }).Nth(index).ClickAsync();
    }

    public async Task WhenIAddEmployee(string name, string email)
    {
        await WhenIFillTextbox("enter new employee's name", name);
        await WhenIFillTextbox("enter new employee's email", email);
        await WhenIClickButton("Add employee");
    }

    public async Task WhenICreateTicket(string name, string email, string message, string category)
    {
        await WhenIFillTextboxAndTab("Enter your name:", name);
        await WhenIFillTextboxAndTab("Enter your email:", email);
        await WhenIFillTextboxAndTab("Enter your Message:", message);
        await WhenISelectDropdownOptionByLabel("Choose a category:", category);
    }

    public async Task WhenIUpdateLogo(string logoUrl)
    {
        await _page.Locator("#logotype_url").FillAsync(logoUrl);
        await WhenIClickButton("Submit Link");
    }

    public async Task ThenIShouldSeeHeading(string headingText)
    {
        await Expect(_page.GetByRole(AriaRole.Heading, new() { Name = headingText }))
            .ToBeVisibleAsync();
    }

    public async Task ThenIShouldSeeText(string text)
    {
        await Expect(_page.GetByRole(AriaRole.Main)).ToContainTextAsync(text);
    }

    public async Task ThenIShouldSeeElement(string role, string name)
    {
        await Expect(_page.GetByRole(AriaRoleHelper(role), new() { Name = name }))
            .ToBeVisibleAsync();
    }

    private AriaRole AriaRoleHelper(string roleName)
    {
        return roleName.ToLower() switch
        {
            "link" => AriaRole.Link,
            "button" => AriaRole.Button,
            "heading" => AriaRole.Heading,
            "img" => AriaRole.Img,
            _ => AriaRole.Generic,
        };
    }

    [TestMethod]
    public async Task GivenIWantToCreateACompanyWhenISubmitValidDetailsThenAccountIsCreated()
    {
        await GivenIAmOnPage("http://localhost:5001/alcorel");

        await WhenIRegisterCompany(
            "testcompany",
            "123456",
            "test testsson",
            "testament@test.com",
            "testtest"
        );

        await WhenIClickButton("Create Account");
        await ThenIShouldSeeHeading("Login");
    }

    [TestMethod]
    public async Task GivenIAmOnCompanySiteWhenISubmitTicketThenItShouldBeCreatedSuccessfully()
    {
        await GivenIAmOnPage("http://localhost:5001/company/11");
        await Page.ReloadAsync();
        await GivenIAmOnPage("http://localhost:5001/company/11");
        await WhenICreateTicket("test", "cj@cj.com", "test ticket", "Öl");
        await WhenIClickButton("Submit");
        await ThenIShouldSeeText("Ticket created successfully!");
    }

    [TestMethod]
    public async Task GivenValidCredentialsWhenILoginThenIShouldBeAuthenticated()
    {
        await GivenIAmLoggedInAsCompany("testament@test.com", "testtest");
        await ThenIShouldSeeElement("link", "Edit Categories");
    }

    [TestMethod]
    public async Task GivenIAmLoggedInWhenIUpdateLogoThenItShouldBeDisplayed()
    {
        await GivenIAmLoggedInAsCompany("testament@test.com", "testtest");
        await WhenIUpdateLogo(
            "https://cpmr-islands.org/wp-content/uploads/sites/4/2019/07/Test-Logo-Small-Black-transparent-1.png"
        );

        await WhenIClickLink("Dashboard");
        await ThenIShouldSeeElement("img", "Your Company's logo");
    }

    [TestMethod]
    public async Task GivenIAmLoggedInWhenIManageCategoriesThenChangesShouldBeSaved()
    {
        await GivenIAmLoggedInAsCompany("testament@test.com", "testtest");
        await WhenIClickLink("Edit Categories");
        await WhenIAddCategory("test");
        await WhenIEditCategory(1, "testtest");
        await WhenIDeleteCategory(1);
    }

    // [TestMethod]
    // public async Task GivenIAmLoggedInWhenIManageQuestionsThenChangesShouldBeSaved()
    // {
    //     await GivenIAmLoggedInAsCompany("testament@test.com", "testtest");
    //     await WhenIClickLink("Add Questions");
    //     await WhenISelectDropdownOption("select", "testquestion");
    //     await WhenIAddQuestion("testquestion", "testquestion");
    //     await WhenIEditQuestion(0, "testquestionstest");
    //     await WhenIDeleteQuestion(0);
    //     await WhenISelectDropdownOptionByIndex("select[name=\"category_id\"]", 0);
    //     await _page.GetByPlaceholder("New question").FillAsync("testquestion");
    //     await WhenIClickButton("Add Question");
    // }

    [TestMethod]
    public async Task GivenIAmLoggedInWhenIManageEmployeesThenChangesShouldBeSaved()
    {
        await GivenIAmLoggedInAsCompany("testament@test.com", "testtest");
        await WhenIClickLink("Manage Employee");
        await WhenIAddEmployee("test testsson", "test@testsson.com");
        await _page.GetByTitle("Eliminate test testsson").ClickAsync();
    }

    [TestMethod]
    public async Task GivenIAmLoggedInWhenILogoutThenIShouldBeSignedOut()
    {
        await GivenIAmLoggedInAsCompany("testament@test.com", "testtest");
        await WhenIClickLink("log-out ⏻");
        await ThenIShouldSeeElement("heading", "Login");
    }

    public async Task LoginToMailinator(IPage page, string email, string password)
    {
        await page.GotoAsync("https://www.mailinator.com/v4/login.jsp");
        await page.WaitForLoadStateAsync(LoadState.NetworkIdle);

        await page.GetByRole(AriaRole.Textbox, new() { Name = "Email field" }).FillAsync(email);
        await page.GetByRole(AriaRole.Textbox, new() { Name = "Password field" })
            .FillAsync(password);
        await page.GetByLabel("Login link").ClickAsync();
        await page.WaitForLoadStateAsync(LoadState.NetworkIdle);
    }

    public async Task OpenLatestEmail(IPage page)
    {
        await page.WaitForLoadStateAsync(LoadState.NetworkIdle);
        await page.WaitForTimeoutAsync(1000);
        await page.Locator("tr[id^='row_gui-']").First.ClickAsync();
    }

    [TestMethod]
    public async Task TempMailTest()
    {
        Page1 = await _browserContext.NewPageAsync();

        await _page.GotoAsync("http://localhost:5001/company/11");
        await _page.WaitForLoadStateAsync(LoadState.NetworkIdle);
        await WhenICreateTicket("test", "gui@alcorelteam.testinator.com", "test ticket", "Öl");
        await WhenIClickButton("Submit");
        await ThenIShouldSeeText("Ticket created successfully!");

        await LoginToMailinator(Page1, "alcorel.solutions@gmail.com", "Happybirthday69!");
        await OpenLatestEmail(Page1);

        var page2 = await Page1.RunAndWaitForPopupAsync(async () =>
        {
            await Page1
                .Locator("iframe[name=\"html_msg_body\"]")
                .ContentFrame.GetByRole(
                    AriaRole.Link,
                    new() { Name = "Complete Additional Questions" }
                )
                .ClickAsync();
        });
        await Expect(page2.Locator(".status.waiting")).ToBeVisibleAsync();
    }
}
