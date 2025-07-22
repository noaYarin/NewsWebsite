using System.Net;
using System.Text;
using System.Text.Json;
using HtmlAgilityPack;

namespace Horizon.DAL;

public class SummarizerService : DBService
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;

    public SummarizerService()
    {
        var configuration = new ConfigurationBuilder()
            .AddJsonFile("appsettings.json").Build();
        _apiKey = configuration["HuggingFace:ApiKey"];

        _httpClient = new HttpClient();
        _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {_apiKey}");
    }

    public async Task<string> SummarizeAsync(string text)
    {
        var requestJson = JsonSerializer.Serialize(new { inputs = text });
        var content = new StringContent(requestJson, Encoding.UTF8, "application/json");

        var response = await _httpClient.PostAsync(
            "https://api-inference.huggingface.co/models/facebook/bart-large-cnn",
            content
        );

        if (response.StatusCode == (HttpStatusCode)429)
        {
            throw new HttpRequestException("You have reached the daily limit of free requests to Hugging Face API (status 429).");
        }

        if (!response.IsSuccessStatusCode)
        {
            throw new Exception($"API Error: {response.StatusCode}");
        }

        var responseJson = await response.Content.ReadAsStringAsync();
        var jsonDoc = JsonDocument.Parse(responseJson);

        return jsonDoc.RootElement[0].GetProperty("summary_text").GetString() ?? string.Empty;
    }

    public async Task<string> SummarizeFromUrlAsync(string url)
    {
        string html = await _httpClient.GetStringAsync(url);

        var doc = new HtmlDocument();
        doc.LoadHtml(html);

        var paragraphs = doc.DocumentNode
                            .SelectNodes("//p")
                            ?.Select(p => p.InnerText.Trim())
                            .Where(p => !string.IsNullOrWhiteSpace(p))
                            .ToList();

        if (paragraphs == null || paragraphs.Count == 0)
            throw new Exception("No text found in the provided URL.");

        string articleText = string.Join(" ", paragraphs);

        return await SummarizeAsync(articleText);
    }
}
