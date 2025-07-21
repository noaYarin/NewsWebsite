using System.Net;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace Horizon.Services
{
    public class HuggingFaceSummarizer
    {
        private readonly string apiKey;
        private readonly HttpClient httpClient;

        public HuggingFaceSummarizer(IConfiguration config)
        {
            apiKey = config["HuggingFace:ApiKey"];
            httpClient = new HttpClient();
            httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {apiKey}");
        }

        public async Task<string> SummarizeAsync(string text)
        {
            var requestJson = JsonSerializer.Serialize(new { inputs = text });
            var content = new StringContent(requestJson, Encoding.UTF8, "application/json");

            //Send article to huggingface
            var response = await httpClient.PostAsync(
                "https://api-inference.huggingface.co/models/facebook/bart-large-cnn",
                content
            );

            if (response.StatusCode == (HttpStatusCode)429)
            {
                throw new HttpRequestException("You have reached the daily limit of free requests to Hugging Face API (status 429).");
            }

            if (!response.IsSuccessStatusCode)
                throw new Exception($"API Error: {response.StatusCode}");
            
            //Read 
            var responseJson = await response.Content.ReadAsStringAsync();
            var jsonDoc = JsonDocument.Parse(responseJson);

            return jsonDoc.RootElement[0].GetProperty("summary_text").GetString();
        }

        public async Task<string> SummarizeFromUrlAsync(string url)
        {
            using var client = new HttpClient();
            string html = await client.GetStringAsync(url);

            var doc = new HtmlAgilityPack.HtmlDocument();
            doc.LoadHtml(html);

            var paragraphs = doc.DocumentNode
                                .SelectNodes("//p")
                                ?.Select(p => p.InnerText.Trim())
                                .Where(p => !string.IsNullOrWhiteSpace(p))
                                .ToList();

            if (paragraphs == null || paragraphs.Count == 0)
                throw new Exception("No text found in the provided URL.");

            string articleUrl = string.Join(" ", paragraphs);

            return await SummarizeAsync(articleUrl);
        }
    }
}
