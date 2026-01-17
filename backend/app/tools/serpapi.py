from serpapi import GoogleSearch
import os

class SerpAPI:
    def __init__(self):
        self.api_key = os.environ.get("SERPAPI_API_KEY")

    def search(self, query):
        params = {
            "api_key": self.api_key,
            "q": query,
        }
        search = GoogleSearch(params)
        results = search.get_dict()
        return results

serpapi_client = SerpAPI()
