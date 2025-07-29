# Model Selection and Optimization

## Overview

Model selection and optimization are critical aspects of building effective Generative AI applications. This involves choosing the right models for specific tasks, optimizing their performance, and balancing trade-offs between quality, latency, and cost. In the Databricks ecosystem, this includes leveraging Foundation Model APIs, custom models, and various optimization techniques.

## Core Concepts

### 1. Types of Models in Generative AI

#### Foundation Models
Large, pre-trained models available through APIs:
- **LLaMA 2/3**: Open-source models for various text tasks
- **GPT-4**: High-quality text generation and reasoning
- **Claude**: Conversational AI with strong safety features
- **PaLM**: Google's powerful language model

#### Embedding Models
Convert text to numerical representations:
- **BGE (BAAI General Embedding)**: High-quality multilingual embeddings
- **E5**: Versatile embedding model for various tasks
- **Sentence-BERT**: Optimized for sentence-level embeddings
- **OpenAI text-embedding-ada-002**: Commercial embedding service

#### Task-Specific Models
Models fine-tuned for specific applications:
- **Summarization**: BART, T5, Pegasus
- **Question Answering**: RoBERTa, DeBERTa
- **Classification**: BERT variants, DistilBERT
- **Code Generation**: CodeT5, StarCoder

### 2. Model Selection Criteria

```python
from dataclasses import dataclass
from typing import List, Dict, Optional
from enum import Enum

class TaskType(Enum):
    TEXT_GENERATION = "text_generation"
    SUMMARIZATION = "summarization"
    QUESTION_ANSWERING = "qa"
    CLASSIFICATION = "classification"
    EMBEDDING = "embedding"
    CODE_GENERATION = "code_generation"

@dataclass
class ModelRequirements:
    task_type: TaskType
    max_latency_ms: int
    max_cost_per_token: float
    min_quality_score: float
    context_length_needed: int
    throughput_required: int  # requests per second
    privacy_requirements: str  # "public", "private", "on_premise"

@dataclass
class ModelCapabilities:
    model_name: str
    task_types: List[TaskType]
    context_length: int
    avg_latency_ms: int
    cost_per_token: float
    quality_scores: Dict[str, float]
    max_throughput: int
    deployment_options: List[str]

class ModelSelector:
    """
    Intelligent model selection based on requirements
    """
    
    def __init__(self):
        self.available_models = self._load_model_catalog()
    
    def select_best_model(self, requirements: ModelRequirements) -> List[ModelCapabilities]:
        """
        Select best models based on requirements
        """
        candidates = []
        
        for model in self.available_models:
            if self._meets_requirements(model, requirements):
                score = self._calculate_suitability_score(model, requirements)
                candidates.append((model, score))
        
        # Sort by suitability score
        candidates.sort(key=lambda x: x[1], reverse=True)
        
        return [model for model, score in candidates[:3]]
    
    def _meets_requirements(self, model: ModelCapabilities, req: ModelRequirements) -> bool:
        """Check if model meets basic requirements"""
        return (
            req.task_type in model.task_types and
            model.avg_latency_ms <= req.max_latency_ms and
            model.cost_per_token <= req.max_cost_per_token and
            model.context_length >= req.context_length_needed and
            model.max_throughput >= req.throughput_required
        )
    
    def _calculate_suitability_score(self, model: ModelCapabilities, req: ModelRequirements) -> float:
        """Calculate how suitable a model is for the requirements"""
        # Weighted scoring based on requirements
        quality_weight = 0.4
        cost_weight = 0.3
        latency_weight = 0.2
        throughput_weight = 0.1
        
        # Quality score (higher is better)
        task_name = req.task_type.value
        quality_score = model.quality_scores.get(task_name, 0.5)
        
        # Cost score (lower cost is better)
        cost_score = 1.0 - (model.cost_per_token / req.max_cost_per_token)
        
        # Latency score (lower latency is better)
        latency_score = 1.0 - (model.avg_latency_ms / req.max_latency_ms)
        
        # Throughput score (higher throughput is better)
        throughput_score = min(1.0, model.max_throughput / req.throughput_required)
        
        total_score = (
            quality_weight * quality_score +
            cost_weight * cost_score +
            latency_weight * latency_score +
            throughput_weight * throughput_score
        )
        
        return total_score
```

## Databricks Model Selection

### 1. Foundation Model APIs

```python
from databricks.sdk import WorkspaceClient
import mlflow
from typing import Dict, Any

class DatabricksModelManager:
    """
    Manage Databricks Foundation Models and custom models
    """
    
    def __init__(self):
        self.client = WorkspaceClient()
        
    def list_available_models(self) -> List[Dict[str, Any]]:
        """
        List all available Foundation Models
        """
        try:
            # Get available serving endpoints
            endpoints = self.client.serving_endpoints.list()
            
            models = []
            for endpoint in endpoints:
                model_info = {
                    'name': endpoint.name,
                    'state': endpoint.state,
                    'config': endpoint.config,
                    'creation_timestamp': endpoint.creation_timestamp
                }
                models.append(model_info)
            
            return models
        except Exception as e:
            print(f"Error listing models: {e}")
            return []
    
    def benchmark_models(self, test_prompts: List[str], model_names: List[str]) -> Dict[str, Dict]:
        """
        Benchmark multiple models on test prompts
        """
        results = {}
        
        for model_name in model_names:
            model_results = {
                'responses': [],
                'latencies': [],
                'token_counts': [],
                'costs': []
            }
            
            for prompt in test_prompts:
                start_time = time.time()
                
                try:
                    response = self.client.serving_endpoints.query(
                        name=model_name,
                        inputs=[{"prompt": prompt}]
                    )
                    
                    latency = time.time() - start_time
                    
                    model_results['responses'].append(response)
                    model_results['latencies'].append(latency)
                    model_results['token_counts'].append(self._estimate_tokens(response))
                    model_results['costs'].append(self._calculate_cost(model_name, response))
                    
                except Exception as e:
                    print(f"Error with model {model_name}: {e}")
                    model_results['responses'].append(None)
                    model_results['latencies'].append(float('inf'))
            
            results[model_name] = model_results
        
        return results
    
    def _estimate_tokens(self, response: Dict) -> int:
        """Estimate token count from response"""
        # Simple estimation - replace with actual tokenizer
        text = str(response)
        return len(text.split())
    
    def _calculate_cost(self, model_name: str, response: Dict) -> float:
        """Calculate cost based on model pricing"""
        # Implement actual cost calculation based on model pricing
        token_count = self._estimate_tokens(response)
        
        # Example pricing (replace with actual rates)
        pricing = {
            'databricks-meta-llama-3-1-70b-instruct': 0.001,  # per 1K tokens
            'databricks-meta-llama-3-1-8b-instruct': 0.0002,
            'databricks-dbrx-instruct': 0.0015
        }
        
        rate = pricing.get(model_name, 0.001)
        return (token_count / 1000) * rate
```

### 2. Custom Model Integration

```python
import mlflow
from mlflow.pyfunc import PythonModel
import pandas as pd
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch

class CustomLLMWrapper(PythonModel):
    """
    Wrapper for custom LLM models in MLflow
    """
    
    def load_context(self, context):
        """Load model and tokenizer"""
        model_path = context.artifacts["model"]
        
        self.tokenizer = AutoTokenizer.from_pretrained(model_path)
        self.model = AutoModelForCausalLM.from_pretrained(
            model_path,
            torch_dtype=torch.float16,
            device_map="auto"
        )
        
        # Set pad token if not exists
        if self.tokenizer.pad_token is None:
            self.tokenizer.pad_token = self.tokenizer.eos_token
    
    def predict(self, context, model_input):
        """Generate predictions"""
        if isinstance(model_input, pd.DataFrame):
            prompts = model_input['prompt'].tolist()
        else:
            prompts = model_input
        
        results = []
        
        for prompt in prompts:
            # Tokenize input
            inputs = self.tokenizer.encode(prompt, return_tensors="pt")
            
            # Generate response
            with torch.no_grad():
                outputs = self.model.generate(
                    inputs,
                    max_length=inputs.shape[1] + 150,
                    num_return_sequences=1,
                    temperature=0.7,
                    do_sample=True,
                    pad_token_id=self.tokenizer.eos_token_id
                )
            
            # Decode response
            response = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
            # Remove input prompt from response
            response = response[len(prompt):].strip()
            
            results.append(response)
        
        return results

def register_custom_model(model_name: str, model_path: str, catalog: str, schema: str):
    """
    Register custom model in Unity Catalog
    """
    with mlflow.start_run():
        # Log model artifacts
        mlflow.pyfunc.log_model(
            "model",
            python_model=CustomLLMWrapper(),
            artifacts={"model": model_path},
            signature=mlflow.models.infer_signature(
                ["Tell me about AI"],
                ["AI is artificial intelligence..."]
            )
        )
        
        # Register to Unity Catalog
        model_uri = mlflow.get_artifact_uri("model")
        registered_model = mlflow.register_model(
            model_uri=model_uri,
            name=f"{catalog}.{schema}.{model_name}"
        )
        
        return registered_model
```

### 3. Model Performance Optimization

```python
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
import numpy as np

class ModelOptimizer:
    """
    Optimize model performance through various techniques
    """
    
    def __init__(self, model_endpoint: str):
        self.model_endpoint = model_endpoint
        self.client = WorkspaceClient()
        
    def optimize_batch_processing(self, prompts: List[str], batch_size: int = 10) -> List[str]:
        """
        Optimize processing through batching
        """
        responses = []
        
        for i in range(0, len(prompts), batch_size):
            batch = prompts[i:i + batch_size]
            
            # Process batch
            batch_responses = self._process_batch(batch)
            responses.extend(batch_responses)
        
        return responses
    
    def _process_batch(self, batch: List[str]) -> List[str]:
        """Process a batch of prompts"""
        try:
            # Format batch request
            inputs = [{"prompt": prompt} for prompt in batch]
            
            response = self.client.serving_endpoints.query(
                name=self.model_endpoint,
                inputs=inputs
            )
            
            return [r.get('candidates', [{}])[0].get('text', '') for r in response.predictions]
        
        except Exception as e:
            print(f"Batch processing error: {e}")
            return ["Error"] * len(batch)
    
    def optimize_concurrent_processing(self, prompts: List[str], max_workers: int = 5) -> List[str]:
        """
        Optimize processing through concurrency
        """
        responses = [None] * len(prompts)
        
        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            # Submit all requests
            future_to_index = {
                executor.submit(self._process_single, prompt): i 
                for i, prompt in enumerate(prompts)
            }
            
            # Collect results
            for future in as_completed(future_to_index):
                index = future_to_index[future]
                try:
                    responses[index] = future.result()
                except Exception as e:
                    print(f"Error processing prompt {index}: {e}")
                    responses[index] = "Error"
        
        return responses
    
    def _process_single(self, prompt: str) -> str:
        """Process single prompt"""
        try:
            response = self.client.serving_endpoints.query(
                name=self.model_endpoint,
                inputs=[{"prompt": prompt}]
            )
            return response.predictions[0].get('candidates', [{}])[0].get('text', '')
        except Exception as e:
            return f"Error: {str(e)}"
    
    def adaptive_timeout_optimization(self, prompts: List[str]) -> List[str]:
        """
        Implement adaptive timeout based on prompt complexity
        """
        responses = []
        
        for prompt in prompts:
            # Estimate complexity
            complexity = self._estimate_complexity(prompt)
            timeout = self._calculate_adaptive_timeout(complexity)
            
            try:
                response = self._process_with_timeout(prompt, timeout)
                responses.append(response)
            except TimeoutError:
                # Retry with longer timeout
                extended_timeout = timeout * 2
                try:
                    response = self._process_with_timeout(prompt, extended_timeout)
                    responses.append(response)
                except:
                    responses.append("Timeout error")
        
        return responses
    
    def _estimate_complexity(self, prompt: str) -> float:
        """Estimate prompt complexity"""
        # Simple complexity estimation
        factors = {
            'length': len(prompt) / 1000,
            'questions': prompt.count('?') * 0.2,
            'code_blocks': prompt.count('```') * 0.5,
            'math': len([c for c in prompt if c in '∑∫√±']) * 0.3
        }
        
        return sum(factors.values())
    
    def _calculate_adaptive_timeout(self, complexity: float) -> int:
        """Calculate timeout based on complexity"""
        base_timeout = 10  # seconds
        return int(base_timeout + (complexity * 5))
```

## Embedding Model Selection

### 1. Embedding Model Comparison

```python
from sentence_transformers import SentenceTransformer
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
import time

class EmbeddingModelEvaluator:
    """
    Evaluate and compare embedding models
    """
    
    def __init__(self):
        self.models = {}
        
    def load_models(self, model_names: List[str]):
        """Load multiple embedding models for comparison"""
        for name in model_names:
            try:
                print(f"Loading model: {name}")
                self.models[name] = SentenceTransformer(name)
            except Exception as e:
                print(f"Error loading {name}: {e}")
    
    def evaluate_models(self, test_texts: List[str], similarity_pairs: List[tuple]) -> Dict[str, Dict]:
        """
        Evaluate models on test data
        
        Args:
            test_texts: List of texts to embed
            similarity_pairs: List of (text1, text2, expected_similarity) tuples
        """
        results = {}
        
        for model_name, model in self.models.items():
            print(f"Evaluating {model_name}...")
            
            # Measure embedding time
            start_time = time.time()
            embeddings = model.encode(test_texts)
            embedding_time = time.time() - start_time
            
            # Evaluate on similarity pairs
            similarity_scores = []
            for text1, text2, expected in similarity_pairs:
                emb1 = model.encode([text1])
                emb2 = model.encode([text2])
                
                similarity = cosine_similarity(emb1, emb2)[0][0]
                similarity_scores.append({
                    'predicted': similarity,
                    'expected': expected,
                    'error': abs(similarity - expected)
                })
            
            # Calculate metrics
            avg_error = np.mean([s['error'] for s in similarity_scores])
            
            results[model_name] = {
                'embedding_time': embedding_time,
                'avg_embedding_time_per_text': embedding_time / len(test_texts),
                'similarity_evaluation': similarity_scores,
                'avg_similarity_error': avg_error,
                'embedding_dimension': embeddings.shape[1],
                'model_size_mb': self._estimate_model_size(model_name)
            }
        
        return results
    
    def _estimate_model_size(self, model_name: str) -> float:
        """Estimate model size in MB"""
        # Rough estimates - replace with actual measurements
        size_estimates = {
            'all-MiniLM-L6-v2': 90,
            'all-mpnet-base-v2': 420,
            'all-distilroberta-v1': 290,
            'all-MiniLM-L12-v2': 130,
            'multi-qa-mpnet-base-dot-v1': 420
        }
        
        return size_estimates.get(model_name, 200)  # Default estimate
    
    def recommend_model(self, requirements: Dict[str, Any]) -> str:
        """
        Recommend best model based on requirements
        """
        max_size_mb = requirements.get('max_size_mb', 500)
        max_latency_ms = requirements.get('max_latency_ms', 1000)
        min_accuracy = requirements.get('min_accuracy', 0.8)
        
        candidates = []
        
        for model_name, metrics in self.evaluation_results.items():
            if (metrics['model_size_mb'] <= max_size_mb and
                metrics['avg_embedding_time_per_text'] * 1000 <= max_latency_ms and
                (1 - metrics['avg_similarity_error']) >= min_accuracy):
                
                # Calculate score based on size, speed, and accuracy
                score = (
                    (1 - metrics['avg_similarity_error']) * 0.5 +  # Accuracy weight
                    (1 - metrics['model_size_mb'] / max_size_mb) * 0.3 +  # Size weight
                    (1 - metrics['avg_embedding_time_per_text'] * 1000 / max_latency_ms) * 0.2  # Speed weight
                )
                
                candidates.append((model_name, score))
        
        if candidates:
            candidates.sort(key=lambda x: x[1], reverse=True)
            return candidates[0][0]
        else:
            return "No model meets requirements"
```

### 2. Context Length Optimization

```python
class ContextLengthOptimizer:
    """
    Optimize context length for embedding models
    """
    
    def __init__(self, model_name: str):
        self.model = SentenceTransformer(model_name)
        self.model_name = model_name
        
    def find_optimal_context_length(self, documents: List[str], max_length: int = 512) -> Dict[str, Any]:
        """
        Find optimal context length for given documents
        """
        context_lengths = [128, 256, 384, 512, 768, 1024]
        context_lengths = [l for l in context_lengths if l <= max_length]
        
        results = {}
        
        for length in context_lengths:
            print(f"Testing context length: {length}")
            
            # Truncate documents to context length
            truncated_docs = [doc[:length*4] for doc in documents]  # Rough char to token conversion
            
            # Measure embedding quality and performance
            start_time = time.time()
            embeddings = self.model.encode(truncated_docs)
            embedding_time = time.time() - start_time
            
            # Calculate information retention (how much of original content is preserved)
            info_retention = sum(len(truncated) for truncated in truncated_docs) / sum(len(doc) for doc in documents)
            
            # Evaluate semantic preservation
            semantic_score = self._evaluate_semantic_preservation(documents, truncated_docs)
            
            results[length] = {
                'embedding_time': embedding_time,
                'information_retention': info_retention,
                'semantic_preservation': semantic_score,
                'avg_time_per_doc': embedding_time / len(documents)
            }
        
        # Find optimal length balancing quality and performance
        optimal_length = self._select_optimal_length(results)
        
        return {
            'optimal_length': optimal_length,
            'all_results': results,
            'recommendation': self._generate_recommendation(optimal_length, results[optimal_length])
        }
    
    def _evaluate_semantic_preservation(self, original_docs: List[str], truncated_docs: List[str]) -> float:
        """
        Evaluate how well truncated documents preserve semantic meaning
        """
        if len(original_docs) != len(truncated_docs):
            return 0.0
        
        similarities = []
        
        for orig, trunc in zip(original_docs, truncated_docs):
            if len(trunc.strip()) == 0:
                similarities.append(0.0)
                continue
                
            orig_embedding = self.model.encode([orig])
            trunc_embedding = self.model.encode([trunc])
            
            similarity = cosine_similarity(orig_embedding, trunc_embedding)[0][0]
            similarities.append(similarity)
        
        return np.mean(similarities)
    
    def _select_optimal_length(self, results: Dict[int, Dict]) -> int:
        """
        Select optimal context length based on multiple criteria
        """
        scores = {}
        
        for length, metrics in results.items():
            # Weighted score: semantic preservation (60%), info retention (25%), speed (15%)
            score = (
                metrics['semantic_preservation'] * 0.6 +
                metrics['information_retention'] * 0.25 +
                (1 / metrics['avg_time_per_doc']) * 0.15  # Inverse of time (faster is better)
            )
            scores[length] = score
        
        return max(scores, key=scores.get)
```

## Model Performance Monitoring

### 1. Real-time Performance Tracking

```python
import mlflow
from databricks.sdk import WorkspaceClient
import pandas as pd
from datetime import datetime, timedelta

class ModelPerformanceMonitor:
    """
    Monitor model performance in production
    """
    
    def __init__(self, model_endpoint: str):
        self.model_endpoint = model_endpoint
        self.client = WorkspaceClient()
        
    def setup_monitoring(self, monitoring_config: Dict[str, Any]):
        """
        Setup comprehensive model monitoring
        """
        # Configure MLflow monitoring
        mlflow.set_tracking_uri("databricks")
        
        # Setup performance tracking
        self.performance_metrics = {
            'latency_threshold_ms': monitoring_config.get('latency_threshold_ms', 1000),
            'error_rate_threshold': monitoring_config.get('error_rate_threshold', 0.05),
            'throughput_threshold': monitoring_config.get('throughput_threshold', 100)
        }
        
        # Initialize metrics storage
        self.metrics_history = []
    
    def track_request_metrics(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Track metrics for individual requests
        """
        start_time = time.time()
        
        try:
            # Make request to model
            response = self.client.serving_endpoints.query(
                name=self.model_endpoint,
                inputs=request_data['inputs']
            )
            
            end_time = time.time()
            latency = (end_time - start_time) * 1000  # Convert to milliseconds
            
            # Calculate metrics
            metrics = {
                'timestamp': datetime.now(),
                'latency_ms': latency,
                'input_tokens': self._count_tokens(request_data['inputs']),
                'output_tokens': self._count_tokens(response),
                'success': True,
                'error_type': None
            }
            
            # Log to MLflow
            with mlflow.start_run():
                mlflow.log_metric("latency_ms", latency)
                mlflow.log_metric("input_tokens", metrics['input_tokens'])
                mlflow.log_metric("output_tokens", metrics['output_tokens'])
            
            self.metrics_history.append(metrics)
            
            return metrics
            
        except Exception as e:
            end_time = time.time()
            latency = (end_time - start_time) * 1000
            
            error_metrics = {
                'timestamp': datetime.now(),
                'latency_ms': latency,
                'input_tokens': self._count_tokens(request_data['inputs']),
                'output_tokens': 0,
                'success': False,
                'error_type': type(e).__name__
            }
            
            self.metrics_history.append(error_metrics)
            
            return error_metrics
    
    def generate_performance_report(self, time_window_hours: int = 24) -> Dict[str, Any]:
        """
        Generate performance report for specified time window
        """
        cutoff_time = datetime.now() - timedelta(hours=time_window_hours)
        recent_metrics = [m for m in self.metrics_history if m['timestamp'] > cutoff_time]
        
        if not recent_metrics:
            return {"error": "No metrics available for specified time window"}
        
        # Calculate aggregated metrics
        successful_requests = [m for m in recent_metrics if m['success']]
        failed_requests = [m for m in recent_metrics if not m['success']]
        
        report = {
            'time_window_hours': time_window_hours,
            'total_requests': len(recent_metrics),
            'successful_requests': len(successful_requests),
            'failed_requests': len(failed_requests),
            'error_rate': len(failed_requests) / len(recent_metrics) if recent_metrics else 0,
            'avg_latency_ms': np.mean([m['latency_ms'] for m in successful_requests]) if successful_requests else 0,
            'p95_latency_ms': np.percentile([m['latency_ms'] for m in successful_requests], 95) if successful_requests else 0,
            'p99_latency_ms': np.percentile([m['latency_ms'] for m in successful_requests], 99) if successful_requests else 0,
            'avg_input_tokens': np.mean([m['input_tokens'] for m in successful_requests]) if successful_requests else 0,
            'avg_output_tokens': np.mean([m['output_tokens'] for m in successful_requests]) if successful_requests else 0,
            'throughput_requests_per_hour': len(recent_metrics) / time_window_hours,
            'error_types': self._analyze_error_types(failed_requests)
        }
        
        # Check against thresholds
        report['alerts'] = self._check_alert_conditions(report)
        
        return report
    
    def _count_tokens(self, text_data: Any) -> int:
        """Estimate token count"""
        if isinstance(text_data, list):
            total_text = " ".join([str(item) for item in text_data])
        else:
            total_text = str(text_data)
        
        # Simple token estimation (replace with actual tokenizer)
        return len(total_text.split())
    
    def _analyze_error_types(self, failed_requests: List[Dict]) -> Dict[str, int]:
        """Analyze types of errors"""
        error_counts = {}
        for request in failed_requests:
            error_type = request.get('error_type', 'Unknown')
            error_counts[error_type] = error_counts.get(error_type, 0) + 1
        
        return error_counts
    
    def _check_alert_conditions(self, report: Dict[str, Any]) -> List[str]:
        """Check if any alert conditions are met"""
        alerts = []
        
        if report['error_rate'] > self.performance_metrics['error_rate_threshold']:
            alerts.append(f"High error rate: {report['error_rate']:.2%}")
        
        if report['avg_latency_ms'] > self.performance_metrics['latency_threshold_ms']:
            alerts.append(f"High latency: {report['avg_latency_ms']:.0f}ms")
        
        if report['throughput_requests_per_hour'] < self.performance_metrics['throughput_threshold']:
            alerts.append(f"Low throughput: {report['throughput_requests_per_hour']:.0f} req/hour")
        
        return alerts
```

## Cost Optimization Strategies

### 1. Dynamic Model Routing

```python
class DynamicModelRouter:
    """
    Route requests to optimal models based on complexity and cost
    """
    
    def __init__(self):
        self.model_tiers = {
            'simple': {
                'model': 'databricks-meta-llama-3-1-8b-instruct',
                'cost_per_token': 0.0002,
                'max_complexity': 0.3
            },
            'medium': {
                'model': 'databricks-meta-llama-3-1-70b-instruct',
                'cost_per_token': 0.001,
                'max_complexity': 0.7
            },
            'complex': {
                'model': 'databricks-dbrx-instruct',
                'cost_per_token': 0.0015,
                'max_complexity': 1.0
            }
        }
        
        self.client = WorkspaceClient()
    
    def route_request(self, prompt: str, user_preferences: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Route request to optimal model based on complexity
        """
        # Analyze prompt complexity
        complexity = self._analyze_prompt_complexity(prompt)
        
        # Consider user preferences
        if user_preferences:
            if user_preferences.get('prioritize_cost', False):
                complexity *= 0.7  # Bias toward cheaper models
            elif user_preferences.get('prioritize_quality', False):
                complexity *= 1.3  # Bias toward better models
        
        # Select appropriate model tier
        selected_tier = self._select_model_tier(complexity)
        
        # Make request
        try:
            response = self.client.serving_endpoints.query(
                name=selected_tier['model'],
                inputs=[{"prompt": prompt}]
            )
            
            # Calculate actual cost
            token_count = self._estimate_tokens(prompt + str(response))
            actual_cost = (token_count / 1000) * selected_tier['cost_per_token']
            
            return {
                'response': response,
                'model_used': selected_tier['model'],
                'complexity_score': complexity,
                'estimated_cost': actual_cost,
                'token_count': token_count
            }
            
        except Exception as e:
            return {
                'error': str(e),
                'model_used': selected_tier['model'],
                'complexity_score': complexity
            }
    
    def _analyze_prompt_complexity(self, prompt: str) -> float:
        """
        Analyze prompt complexity using multiple factors
        """
        factors = {
            'length': min(len(prompt) / 1000, 1.0) * 0.3,
            'code_presence': (prompt.count('```') > 0) * 0.2,
            'math_complexity': min(len([c for c in prompt if c in '∑∫√±∞']) / 10, 1.0) * 0.2,
            'question_complexity': min(prompt.count('?') / 5, 1.0) * 0.1,
            'reasoning_keywords': self._count_reasoning_keywords(prompt) * 0.2
        }
        
        return sum(factors.values())
    
    def _count_reasoning_keywords(self, prompt: str) -> float:
        """Count reasoning-related keywords"""
        reasoning_keywords = [
            'analyze', 'compare', 'evaluate', 'synthesize', 'reason',
            'explain', 'justify', 'argue', 'prove', 'deduce'
        ]
        
        count = sum(1 for keyword in reasoning_keywords if keyword in prompt.lower())
        return min(count / len(reasoning_keywords), 1.0)
    
    def _select_model_tier(self, complexity: float) -> Dict[str, Any]:
        """Select model tier based on complexity"""
        for tier_name, tier_config in self.model_tiers.items():
            if complexity <= tier_config['max_complexity']:
                return tier_config
        
        # Default to most capable model for highest complexity
        return self.model_tiers['complex']
```

## Official Documentation References

- [Databricks Foundation Model APIs](https://docs.databricks.com/en/machine-learning/foundation-models/index.html)
- [Model Serving Documentation](https://docs.databricks.com/en/machine-learning/model-serving/index.html)
- [MLflow Model Registry](https://docs.databricks.com/en/mlflow/model-registry.html)
- [Unity Catalog for ML](https://docs.databricks.com/en/data-governance/unity-catalog/index.html)
- [Optimizing Model Performance](https://docs.databricks.com/en/machine-learning/model-serving/model-serving-intro.html)

## Practice Questions

### Question 1 (Easy)
Which factor is MOST important when selecting an embedding model for a RAG application?

A) Model size only
B) Context length and semantic quality
C) Training dataset size
D) Number of parameters

**Answer: B**
**Explanation:** For RAG applications, the embedding model's context length must accommodate your chunk sizes, and semantic quality determines how well it captures meaning for retrieval accuracy.

### Question 2 (Easy)
What is the primary advantage of using Databricks Foundation Model APIs over self-hosted models?

A) Lower cost
B) Managed infrastructure and automatic scaling
C) Better accuracy
D) Unlimited context length

**Answer: B**
**Explanation:** Foundation Model APIs provide managed infrastructure, automatic scaling, and maintenance, eliminating the need to manage model deployment and infrastructure.

### Question 3 (Medium)
A RAG application requires processing 1000 documents with varying complexity. Which model selection strategy would be MOST cost-effective?

A) Use the largest model for all documents
B) Use the smallest model for all documents
C) Implement dynamic model routing based on document complexity
D) Process all documents with medium-sized model

**Answer: C**
**Explanation:** Dynamic model routing allows using simpler, cheaper models for straightforward content and reserving expensive models for complex documents, optimizing cost-performance balance.

### Question 4 (Medium)
When optimizing context length for an embedding model, which metric is MOST important to monitor?

A) Embedding generation speed only
B) Information retention vs. semantic preservation balance
C) Model size reduction
D) Token count accuracy

**Answer: B**
**Explanation:** Context length optimization requires balancing information retention (how much content is preserved) with semantic preservation (how well meaning is maintained), as both affect retrieval quality.

### Question 5 (Medium)
For a production RAG system with strict latency requirements, which optimization technique provides the BEST performance improvement?

A) Using larger models only
B) Implementing request batching and concurrent processing
C) Increasing context length
D) Reducing chunk overlap

**Answer: B**
**Explanation:** Request batching and concurrent processing can significantly reduce overall latency by optimizing how requests are handled, especially for high-throughput scenarios.

### Question 6 (Hard)
A customer service chatbot shows degrading performance over time. Model monitoring reveals increasing latency but stable accuracy. What is the MOST likely cause and solution?

A) Model drift; retrain the model
B) Infrastructure scaling issues; optimize serving capacity
C) Data quality degradation; clean input data
D) Context length issues; reduce chunk sizes

**Answer: B**
**Explanation:** Stable accuracy with increasing latency typically indicates infrastructure or scaling issues rather than model quality problems. The solution involves optimizing serving capacity and infrastructure.

### Question 7 (Hard)
When implementing A/B testing for model selection in production, which metrics should be prioritized for business-critical applications?

A) Only model accuracy
B) Cost per request only
C) Accuracy, latency, cost, and user satisfaction combined
D) Model size and memory usage

**Answer: C**
**Explanation:** Business-critical applications require comprehensive evaluation including accuracy (quality), latency (user experience), cost (business viability), and user satisfaction (actual business impact).

### Question 8 (Hard)
For a multilingual RAG application, which model selection approach ensures consistent performance across languages?

A) Use the same English model for all languages
B) Use language-specific models with cross-lingual evaluation
C) Translate everything to English first
D) Use only multilingual models without evaluation

**Answer: B**
**Explanation:** Language-specific models often perform better for their target languages, but cross-lingual evaluation ensures consistent quality and performance standards across all supported languages.

### Question 9 (Expert)
A RAG system processes both structured data (tables, JSON) and unstructured text. Which model architecture approach provides optimal performance?

A) Single model for all data types
B) Specialized models for each data type with intelligent routing
C) Convert all data to text format
D) Use only text-based models

**Answer: B**
**Explanation:** Specialized models optimized for specific data types (structured vs. unstructured) with intelligent routing provide better performance than trying to use a single model for diverse data formats.

### Question 10 (Expert)
In a cost-sensitive environment with varying query complexity, which dynamic optimization strategy provides the BEST cost-quality trade-off?

A) Always use the cheapest model
B) Implement complexity-aware model selection with quality gates and cost budgets
C) Use expensive models only during peak hours
D) Randomly distribute requests across model tiers

**Answer: B**
**Explanation:** Complexity-aware model selection with quality gates ensures minimum quality standards while cost budgets control expenses, providing an optimal balance for varying requirements and constraints.
