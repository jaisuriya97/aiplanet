import chromadb
import os

class ChromaDB:
    def __init__(self):
        # Use persistent storage
        persist_directory = os.environ.get("CHROMA_PERSIST_DIRECTORY", "./chroma_data")
        self.client = chromadb.PersistentClient(path=persist_directory)
        self.collection = self.client.get_or_create_collection("documents")

    def add_documents(self, documents, metadatas, ids, embeddings=None):
        if embeddings:
            self.collection.add(
                embeddings=embeddings,
                documents=documents,
                metadatas=metadatas,
                ids=ids
            )
        else:
            self.collection.add(
                documents=documents,
                metadatas=metadatas,
                ids=ids
            )

    def query(self, query_texts, n_results=10):
        return self.collection.query(
            query_texts=query_texts,
            n_results=n_results
        )

chroma_db = ChromaDB()
