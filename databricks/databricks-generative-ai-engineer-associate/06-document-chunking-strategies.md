# Document Chunking Strategies

## Overview

Document chunking is a critical preprocessing step in Retrieval-Augmented Generation (RAG) systems. It involves breaking down large documents into smaller, manageable pieces that can be effectively processed by embedding models and retrieved by vector search systems. Proper chunking strategies directly impact the quality of information retrieval and the overall performance of your RAG application.

## Core Concepts

### 1. What is Document Chunking?

Document chunking is the process of dividing large text documents into smaller segments (chunks) that:
- Fit within the context window of embedding models
- Contain semantically coherent information
- Enable efficient retrieval and processing
- Maintain meaningful context relationships

### 2. Why Chunking Matters

```python
# Example: Impact of chunking on retrieval quality

# Poor chunking - arbitrary splits
bad_chunk = """
...end of chapter 3.
Chapter 4: Machine Learning in Production
Machine learning models require careful monitoring and maintenance once deployed. Performance can degrade over time due to...
"""

# Good chunking - semantic boundaries
good_chunk = """
Chapter 4: Machine Learning in Production

Machine learning models require careful monitoring and maintenance once deployed. Performance can degrade over time due to data drift, concept drift, and changing business requirements. Key monitoring practices include:

1. Model performance metrics tracking
2. Data quality monitoring
3. Feature drift detection
4. Automated retraining pipelines
"""
```

## Chunking Strategies

### 1. Fixed-Size Chunking

The simplest approach, splitting text into fixed-length segments.

```python
def fixed_size_chunking(text, chunk_size=500, overlap=50):
    """
    Split text into fixed-size chunks with overlap
    
    Args:
        text (str): Input text to chunk
        chunk_size (int): Size of each chunk in characters
        overlap (int): Number of characters to overlap between chunks
    
    Returns:
        List[str]: List of text chunks
    """
    chunks = []
    start = 0
    
    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end]
        chunks.append(chunk)
        start = end - overlap
    
    return chunks

# Example usage
document = "Long document text here..."
chunks = fixed_size_chunking(document, chunk_size=512, overlap=50)
```

#### Pros and Cons
- ✅ Simple to implement
- ✅ Predictable chunk sizes
- ❌ May break semantic boundaries
- ❌ Can split sentences or paragraphs awkwardly

### 2. Sentence-Based Chunking

Respects sentence boundaries for better semantic coherence.

```python
import re
from typing import List

def sentence_based_chunking(text: str, max_chunk_size: int = 500) -> List[str]:
    """
    Split text into chunks based on sentence boundaries
    
    Args:
        text (str): Input text
        max_chunk_size (int): Maximum chunk size in characters
    
    Returns:
        List[str]: List of chunks
    """
    # Split into sentences using regex
    sentences = re.split(r'(?<=[.!?])\s+', text)
    
    chunks = []
    current_chunk = ""
    
    for sentence in sentences:
        # Check if adding sentence would exceed max size
        if len(current_chunk + sentence) > max_chunk_size and current_chunk:
            chunks.append(current_chunk.strip())
            current_chunk = sentence
        else:
            current_chunk += (" " if current_chunk else "") + sentence
    
    # Add the last chunk if it has content
    if current_chunk:
        chunks.append(current_chunk.strip())
    
    return chunks

# Enhanced version with NLTK
import nltk
from nltk.tokenize import sent_tokenize

def nltk_sentence_chunking(text: str, max_chunk_size: int = 500) -> List[str]:
    """
    More accurate sentence-based chunking using NLTK
    """
    sentences = sent_tokenize(text)
    chunks = []
    current_chunk = ""
    
    for sentence in sentences:
        if len(current_chunk + sentence) > max_chunk_size and current_chunk:
            chunks.append(current_chunk.strip())
            current_chunk = sentence
        else:
            current_chunk += (" " if current_chunk else "") + sentence
    
    if current_chunk:
        chunks.append(current_chunk.strip())
    
    return chunks
```

### 3. Paragraph-Based Chunking

Maintains paragraph structure for better context preservation.

```python
def paragraph_based_chunking(text: str, max_chunk_size: int = 1000) -> List[str]:
    """
    Split text into chunks based on paragraph boundaries
    
    Args:
        text (str): Input text
        max_chunk_size (int): Maximum chunk size
    
    Returns:
        List[str]: List of chunks
    """
    # Split by double newlines (paragraph separators)
    paragraphs = text.split('\n\n')
    
    chunks = []
    current_chunk = ""
    
    for paragraph in paragraphs:
        paragraph = paragraph.strip()
        if not paragraph:
            continue
            
        # If single paragraph exceeds max size, use sentence chunking
        if len(paragraph) > max_chunk_size:
            if current_chunk:
                chunks.append(current_chunk.strip())
                current_chunk = ""
            
            # Split large paragraph into sentences
            sentence_chunks = sentence_based_chunking(paragraph, max_chunk_size)
            chunks.extend(sentence_chunks)
        else:
            # Check if adding paragraph would exceed max size
            if len(current_chunk + paragraph) > max_chunk_size and current_chunk:
                chunks.append(current_chunk.strip())
                current_chunk = paragraph
            else:
                current_chunk += ("\n\n" if current_chunk else "") + paragraph
    
    if current_chunk:
        chunks.append(current_chunk.strip())
    
    return chunks
```

### 4. Semantic Chunking

Advanced approach using semantic similarity to group related content.

```python
import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

class SemanticChunker:
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        self.model = SentenceTransformer(model_name)
        
    def semantic_chunking(self, text: str, similarity_threshold: float = 0.7) -> List[str]:
        """
        Chunk text based on semantic similarity between sentences
        
        Args:
            text (str): Input text
            similarity_threshold (float): Threshold for semantic similarity
        
        Returns:
            List[str]: Semantically coherent chunks
        """
        sentences = sent_tokenize(text)
        
        if len(sentences) <= 1:
            return [text]
        
        # Generate embeddings for all sentences
        embeddings = self.model.encode(sentences)
        
        chunks = []
        current_chunk_sentences = [sentences[0]]
        
        for i in range(1, len(sentences)):
            # Calculate similarity between current sentence and previous
            prev_embedding = embeddings[i-1].reshape(1, -1)
            curr_embedding = embeddings[i].reshape(1, -1)
            
            similarity = cosine_similarity(prev_embedding, curr_embedding)[0][0]
            
            if similarity >= similarity_threshold:
                current_chunk_sentences.append(sentences[i])
            else:
                # Create chunk from accumulated sentences
                chunks.append(" ".join(current_chunk_sentences))
                current_chunk_sentences = [sentences[i]]
        
        # Add the last chunk
        if current_chunk_sentences:
            chunks.append(" ".join(current_chunk_sentences))
        
        return chunks
```

### 5. Token-Based Chunking

Chunks based on token count for model-specific optimization.

```python
import tiktoken

class TokenBasedChunker:
    def __init__(self, encoding_name: str = "cl100k_base"):
        self.encoding = tiktoken.get_encoding(encoding_name)
    
    def count_tokens(self, text: str) -> int:
        """Count tokens in text"""
        return len(self.encoding.encode(text))
    
    def token_based_chunking(self, text: str, max_tokens: int = 512, overlap_tokens: int = 50) -> List[str]:
        """
        Chunk text based on token count
        
        Args:
            text (str): Input text
            max_tokens (int): Maximum tokens per chunk
            overlap_tokens (int): Number of tokens to overlap
        
        Returns:
            List[str]: Token-optimized chunks
        """
        # Encode the entire text
        tokens = self.encoding.encode(text)
        
        chunks = []
        start = 0
        
        while start < len(tokens):
            end = min(start + max_tokens, len(tokens))
            chunk_tokens = tokens[start:end]
            
            # Decode back to text
            chunk_text = self.encoding.decode(chunk_tokens)
            chunks.append(chunk_text)
            
            # Move start position with overlap
            start = end - overlap_tokens
            
            # Prevent infinite loop
            if start >= end:
                break
        
        return chunks
    
    def smart_token_chunking(self, text: str, max_tokens: int = 512) -> List[str]:
        """
        Token-based chunking that respects sentence boundaries
        """
        sentences = sent_tokenize(text)
        chunks = []
        current_chunk = ""
        current_tokens = 0
        
        for sentence in sentences:
            sentence_tokens = self.count_tokens(sentence)
            
            # If single sentence exceeds max tokens, split it
            if sentence_tokens > max_tokens:
                if current_chunk:
                    chunks.append(current_chunk.strip())
                    current_chunk = ""
                    current_tokens = 0
                
                # Split long sentence using fixed token chunking
                long_chunks = self.token_based_chunking(sentence, max_tokens)
                chunks.extend(long_chunks)
            else:
                # Check if adding sentence would exceed token limit
                if current_tokens + sentence_tokens > max_tokens and current_chunk:
                    chunks.append(current_chunk.strip())
                    current_chunk = sentence
                    current_tokens = sentence_tokens
                else:
                    current_chunk += (" " if current_chunk else "") + sentence
                    current_tokens += sentence_tokens
        
        if current_chunk:
            chunks.append(current_chunk.strip())
        
        return chunks
```

## Databricks Implementation

### 1. Using Databricks for Document Processing

```python
from pyspark.sql import SparkSession
from pyspark.sql.functions import col, udf, explode
from pyspark.sql.types import ArrayType, StringType
import pyspark.sql.functions as F

# Initialize Spark session
spark = SparkSession.builder.appName("DocumentChunking").getOrCreate()

# Define chunking UDF
def create_chunking_udf(chunk_size=500, overlap=50):
    def chunk_text(text):
        if not text:
            return []
        
        chunks = []
        start = 0
        while start < len(text):
            end = start + chunk_size
            chunk = text[start:end]
            chunks.append(chunk)
            start = end - overlap
        
        return chunks
    
    return udf(chunk_text, ArrayType(StringType()))

# Register UDF
chunk_udf = create_chunking_udf(chunk_size=512, overlap=50)

# Process documents
df = spark.read.table("your_catalog.your_schema.documents")

# Apply chunking
chunked_df = df.select(
    col("document_id"),
    col("title"),
    col("content"),
    chunk_udf(col("content")).alias("chunks")
).select(
    col("document_id"),
    col("title"),
    explode(col("chunks")).alias("chunk_content")
).withColumn("chunk_id", F.monotonically_increasing_id())

# Save to Delta table
chunked_df.write.mode("overwrite").saveAsTable("your_catalog.your_schema.document_chunks")
```

### 2. Advanced Chunking with Document Structure

```python
from typing import Dict, List, Tuple
import re

class StructuredDocumentChunker:
    """
    Advanced chunker that preserves document structure
    """
    
    def __init__(self):
        self.header_patterns = {
            'h1': re.compile(r'^#\s+(.+)$', re.MULTILINE),
            'h2': re.compile(r'^##\s+(.+)$', re.MULTILINE),
            'h3': re.compile(r'^###\s+(.+)$', re.MULTILINE),
        }
    
    def extract_structure(self, text: str) -> List[Dict]:
        """
        Extract document structure with headers and content
        """
        sections = []
        lines = text.split('\n')
        current_section = {
            'level': 0,
            'title': 'Document Start',
            'content': '',
            'start_line': 0
        }
        
        for i, line in enumerate(lines):
            header_match = None
            level = 0
            
            # Check for headers
            for level_name, pattern in self.header_patterns.items():
                match = pattern.match(line)
                if match:
                    level = int(level_name[1])  # Extract number from h1, h2, h3
                    header_match = match.group(1)
                    break
            
            if header_match:
                # Save previous section
                if current_section['content'].strip():
                    current_section['end_line'] = i - 1
                    sections.append(current_section.copy())
                
                # Start new section
                current_section = {
                    'level': level,
                    'title': header_match,
                    'content': '',
                    'start_line': i + 1
                }
            else:
                current_section['content'] += line + '\n'
        
        # Add final section
        if current_section['content'].strip():
            current_section['end_line'] = len(lines) - 1
            sections.append(current_section)
        
        return sections
    
    def chunk_with_structure(self, text: str, max_chunk_size: int = 1000) -> List[Dict]:
        """
        Chunk document preserving structural context
        """
        sections = self.extract_structure(text)
        chunks = []
        
        for section in sections:
            section_content = f"# {section['title']}\n\n{section['content']}"
            
            if len(section_content) <= max_chunk_size:
                chunks.append({
                    'content': section_content,
                    'section_title': section['title'],
                    'section_level': section['level'],
                    'chunk_type': 'complete_section'
                })
            else:
                # Split large sections while preserving context
                sub_chunks = self._split_large_section(section, max_chunk_size)
                chunks.extend(sub_chunks)
        
        return chunks
    
    def _split_large_section(self, section: Dict, max_chunk_size: int) -> List[Dict]:
        """
        Split large sections while preserving context
        """
        content = section['content']
        title = section['title']
        level = section['level']
        
        # Use paragraph-based chunking for large sections
        paragraphs = content.split('\n\n')
        chunks = []
        current_chunk = f"# {title}\n\n"
        
        for paragraph in paragraphs:
            paragraph = paragraph.strip()
            if not paragraph:
                continue
            
            # Check if adding paragraph would exceed size
            if len(current_chunk + paragraph) > max_chunk_size and len(current_chunk) > len(f"# {title}\n\n"):
                chunks.append({
                    'content': current_chunk.strip(),
                    'section_title': title,
                    'section_level': level,
                    'chunk_type': 'partial_section'
                })
                current_chunk = f"# {title} (continued)\n\n{paragraph}\n\n"
            else:
                current_chunk += paragraph + "\n\n"
        
        # Add final chunk
        if len(current_chunk) > len(f"# {title}\n\n"):
            chunks.append({
                'content': current_chunk.strip(),
                'section_title': title,
                'section_level': level,
                'chunk_type': 'partial_section'
            })
        
        return chunks
```

### 3. Integration with Databricks Vector Search

```python
from databricks.vector_search.client import VectorSearchClient

class VectorSearchChunker:
    """
    Chunker optimized for Databricks Vector Search
    """
    
    def __init__(self, endpoint_name: str):
        self.vs_client = VectorSearchClient()
        self.endpoint_name = endpoint_name
    
    def prepare_documents_for_vector_search(self, documents: List[Dict], chunk_strategy: str = "smart") -> List[Dict]:
        """
        Prepare documents for Vector Search indexing
        
        Args:
            documents: List of documents with 'id', 'content', and metadata
            chunk_strategy: Chunking strategy to use
        
        Returns:
            List of chunks ready for Vector Search
        """
        prepared_chunks = []
        
        for doc in documents:
            if chunk_strategy == "smart":
                chunks = self._smart_chunking(doc['content'])
            elif chunk_strategy == "semantic":
                chunker = SemanticChunker()
                chunks = chunker.semantic_chunking(doc['content'])
            else:  # default to token-based
                token_chunker = TokenBasedChunker()
                chunks = token_chunker.smart_token_chunking(doc['content'])
            
            # Prepare chunks for Vector Search
            for i, chunk_content in enumerate(chunks):
                chunk_doc = {
                    'id': f"{doc['id']}_chunk_{i}",
                    'content': chunk_content,
                    'parent_document_id': doc['id'],
                    'chunk_index': i,
                    'chunk_type': chunk_strategy
                }
                
                # Add metadata from parent document
                if 'metadata' in doc:
                    chunk_doc.update(doc['metadata'])
                
                prepared_chunks.append(chunk_doc)
        
        return prepared_chunks
    
    def _smart_chunking(self, text: str, max_tokens: int = 512) -> List[str]:
        """
        Smart chunking that balances semantic coherence and token limits
        """
        # First try paragraph-based chunking
        paragraphs = text.split('\n\n')
        
        if len(paragraphs) == 1:
            # Single paragraph - use sentence-based
            return sentence_based_chunking(text, max_tokens * 4)  # Rough token-to-char conversion
        
        chunks = []
        current_chunk = ""
        
        for paragraph in paragraphs:
            # Estimate tokens (rough approximation)
            estimated_tokens = len(paragraph) // 4
            
            if estimated_tokens > max_tokens:
                # Large paragraph - split further
                if current_chunk:
                    chunks.append(current_chunk.strip())
                    current_chunk = ""
                
                # Use sentence-based chunking for large paragraph
                para_chunks = sentence_based_chunking(paragraph, max_tokens * 4)
                chunks.extend(para_chunks)
            else:
                # Check if adding paragraph would exceed token limit
                if len(current_chunk + paragraph) // 4 > max_tokens and current_chunk:
                    chunks.append(current_chunk.strip())
                    current_chunk = paragraph
                else:
                    current_chunk += ("\n\n" if current_chunk else "") + paragraph
        
        if current_chunk:
            chunks.append(current_chunk.strip())
        
        return chunks
```

## Best Practices

### 1. Choosing the Right Strategy

```python
def choose_chunking_strategy(document_type: str, content_length: int, use_case: str) -> str:
    """
    Recommend chunking strategy based on document characteristics
    """
    if document_type == "code":
        return "semantic"  # Preserve code structure
    elif document_type == "legal":
        return "paragraph"  # Preserve legal structure
    elif document_type == "technical_manual":
        return "structured"  # Preserve hierarchical structure
    elif content_length < 1000:
        return "simple"  # Small documents don't need complex chunking
    elif use_case == "qa":
        return "semantic"  # QA benefits from semantic coherence
    else:
        return "smart"  # Default balanced approach
```

### 2. Chunk Size Optimization

```python
def optimize_chunk_size(embedding_model: str, retrieval_method: str) -> Dict[str, int]:
    """
    Optimize chunk size based on model and retrieval method
    """
    optimizations = {
        "sentence-transformers/all-MiniLM-L6-v2": {
            "max_tokens": 256,
            "optimal_tokens": 128,
            "overlap_tokens": 25
        },
        "text-embedding-ada-002": {
            "max_tokens": 8192,
            "optimal_tokens": 1000,
            "overlap_tokens": 100
        },
        "databricks/bge-large-en": {
            "max_tokens": 512,
            "optimal_tokens": 256,
            "overlap_tokens": 50
        }
    }
    
    return optimizations.get(embedding_model, {
        "max_tokens": 512,
        "optimal_tokens": 256,
        "overlap_tokens": 50
    })
```

### 3. Quality Assessment

```python
class ChunkQualityAssessor:
    """
    Assess the quality of document chunks
    """
    
    def assess_chunk_quality(self, chunks: List[str]) -> Dict[str, float]:
        """
        Assess various quality metrics for chunks
        """
        metrics = {
            'avg_length': sum(len(chunk) for chunk in chunks) / len(chunks),
            'length_variance': self._calculate_variance([len(chunk) for chunk in chunks]),
            'semantic_coherence': self._assess_semantic_coherence(chunks),
            'information_density': self._assess_information_density(chunks)
        }
        
        return metrics
    
    def _calculate_variance(self, values: List[float]) -> float:
        """Calculate variance of chunk lengths"""
        mean = sum(values) / len(values)
        return sum((x - mean) ** 2 for x in values) / len(values)
    
    def _assess_semantic_coherence(self, chunks: List[str]) -> float:
        """
        Assess semantic coherence within chunks
        """
        # Use sentence transformer to assess coherence
        model = SentenceTransformer('all-MiniLM-L6-v2')
        coherence_scores = []
        
        for chunk in chunks:
            sentences = sent_tokenize(chunk)
            if len(sentences) < 2:
                coherence_scores.append(1.0)  # Single sentence is perfectly coherent
                continue
            
            embeddings = model.encode(sentences)
            similarities = []
            
            for i in range(len(embeddings) - 1):
                sim = cosine_similarity(
                    embeddings[i].reshape(1, -1),
                    embeddings[i + 1].reshape(1, -1)
                )[0][0]
                similarities.append(sim)
            
            coherence_scores.append(sum(similarities) / len(similarities))
        
        return sum(coherence_scores) / len(coherence_scores)
    
    def _assess_information_density(self, chunks: List[str]) -> float:
        """
        Assess information density (ratio of content words to total words)
        """
        import nltk
        from nltk.corpus import stopwords
        from nltk.tokenize import word_tokenize
        
        stop_words = set(stopwords.words('english'))
        density_scores = []
        
        for chunk in chunks:
            words = word_tokenize(chunk.lower())
            content_words = [word for word in words if word.isalpha() and word not in stop_words]
            
            if len(words) == 0:
                density_scores.append(0.0)
            else:
                density = len(content_words) / len(words)
                density_scores.append(density)
        
        return sum(density_scores) / len(density_scores)
```

## Official Documentation References

- [Databricks Vector Search Documentation](https://docs.databricks.com/en/generative-ai/vector-search.html)
- [Delta Lake for ML](https://docs.databricks.com/en/delta/index.html)
- [MLflow Text Processing](https://mlflow.org/docs/latest/traditional-ml/index.html)
- [Spark SQL Functions](https://spark.apache.org/docs/latest/sql-ref-functions.html)

## Practice Questions

### Question 1 (Easy)
What is the primary purpose of document chunking in RAG applications?

A) To reduce storage costs
B) To fit documents within model context limits while preserving semantic meaning
C) To speed up document loading
D) To encrypt sensitive content

**Answer: B**
**Explanation:** Document chunking breaks large documents into smaller pieces that fit within embedding model context limits while trying to preserve semantic coherence for better retrieval quality.

### Question 2 (Easy)
Which chunking strategy is BEST for preserving sentence boundaries?

A) Fixed-size chunking
B) Random chunking
C) Sentence-based chunking
D) Character-level chunking

**Answer: C**
**Explanation:** Sentence-based chunking specifically respects sentence boundaries, ensuring that sentences are not split awkwardly across chunks.

### Question 3 (Medium)
A Generative AI Engineer is processing legal documents with complex hierarchical structure. Which chunking approach would be MOST appropriate?

A) Fixed 500-character chunks
B) Random paragraph selection
C) Structure-aware chunking that preserves document hierarchy
D) Single-sentence chunks

**Answer: C**
**Explanation:** Legal documents have important hierarchical structure (sections, subsections, clauses) that should be preserved to maintain legal context and meaning.

### Question 4 (Medium)
When using Databricks Vector Search with a maximum context length of 512 tokens, what should you consider for chunk overlap?

A) No overlap is needed
B) 50-100 token overlap to preserve context continuity
C) 50% overlap of total chunk size
D) Overlap only for the first chunk

**Answer: B**
**Explanation:** Moderate overlap (10-20% of chunk size) helps preserve context continuity between chunks without excessive redundancy, improving retrieval quality.

### Question 5 (Medium)
Which metric is MOST important when evaluating chunk quality for a QA system?

A) Chunk count
B) Average chunk length
C) Semantic coherence within chunks
D) File size reduction

**Answer: C**
**Explanation:** For QA systems, semantic coherence within chunks is crucial because it ensures that each chunk contains related information that can effectively answer questions.

### Question 6 (Hard)
In a RAG application processing technical manuals, you notice poor retrieval performance. The documents have been chunked using fixed 500-character segments. What is the MOST likely cause and solution?

A) Chunks are too large; reduce to 250 characters
B) Fixed chunking breaks semantic boundaries; use structure-aware chunking
C) Need more chunks; increase overlap to 90%
D) Remove all punctuation from chunks

**Answer: B**
**Explanation:** Fixed chunking often breaks semantic boundaries in technical documents, disrupting the logical flow of information. Structure-aware chunking preserves the hierarchical organization of technical manuals.

### Question 7 (Hard)
When implementing token-based chunking for multiple embedding models with different context limits, which approach provides the BEST flexibility?

A) Use the smallest context limit for all models
B) Implement dynamic chunking based on model specifications
C) Always use maximum possible context length
D) Create separate documents for each model

**Answer: B**
**Explanation:** Dynamic chunking allows optimization for each model's specific context limits and capabilities, maximizing performance across different models.

### Question 8 (Hard)
For a customer service knowledge base with frequent updates, which chunking strategy minimizes reprocessing overhead?

A) Complete document rechunking on any change
B) Incremental chunking with change detection
C) Fixed-size chunking with version control
D) Manual chunking review for each update

**Answer: B**
**Explanation:** Incremental chunking with change detection only reprocesses modified sections, significantly reducing computational overhead for frequently updated knowledge bases.

### Question 9 (Expert)
A RAG system shows high retrieval recall but low precision. Analysis reveals that chunks contain multiple unrelated topics. Which advanced technique would BEST address this issue?

A) Reduce chunk size by 50%
B) Implement semantic similarity-based chunking
C) Increase overlap between chunks
D) Use random sampling of sentences

**Answer: B**
**Explanation:** Semantic similarity-based chunking groups related content together and separates unrelated topics, improving precision by ensuring chunks contain coherent, topically-related information.

### Question 10 (Expert)
In a production RAG system handling multilingual documents, you need to optimize chunking for both performance and quality. Which comprehensive approach is MOST effective?

A) Apply the same English-optimized chunking to all languages
B) Use language-specific chunking with adaptive token limits and cultural context preservation
C) Translate everything to English first, then chunk
D) Use character-based chunking to avoid language-specific issues

**Answer: B**
**Explanation:** Language-specific chunking considers linguistic differences (sentence structure, punctuation patterns, cultural context) and adapts token limits based on language characteristics, providing optimal performance across different languages.
