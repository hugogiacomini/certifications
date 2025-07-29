# Apache Airflow Fundamentals - Astronomer Certification Study Guide 🚀✨

## Certification Overview 🎓

The **Apache Airflow Fundamentals** certification by Astronomer validates your understanding of core Airflow concepts, DAG development, and operational knowledge required for data engineering workflows. This comprehensive guide covers all exam domains with practical examples, architectural diagrams, and hands-on exercises.

### Exam Details 📝
- **Provider**: Astronomer
- **Duration**: 90 minutes ⏰
- **Questions**: 45 multiple choice questions ❓
- **Passing Score**: 80% (36 correct answers) ✅
- **Validity**: 2 years 📅
- **Prerequisites**: Basic Python knowledge and data pipeline concepts 🐍

### Exam Domains Breakdown 📊
1. **Airflow Core Concepts** (25% - 11 questions) 🧩
2. **DAG Development & Best Practices** (30% - 14 questions) 🛠️
3. **Task Management & Dependencies** (20% - 9 questions) 🔗
4. **Airflow UI & Monitoring** (15% - 7 questions) 👀
5. **Deployment & Operations** (10% - 4 questions) 🚦

---

## Domain 1: Airflow Core Concepts (25%) 🧩

### 1.1 Apache Airflow Architecture 🏗️

Apache Airflow is a platform to programmatically author, schedule, and monitor workflows as Directed Acyclic Graphs (DAGs).

```mermaid
graph TD
    A[Web Server] --> B[Scheduler]
    B --> C[Executor]
    C --> D[Worker Nodes]
    B --> E[Metadata Database]
    A --> E
    F[DAG Files] --> B
    
    subgraph "Core Components"
        G[Web UI]
        H[CLI]
        I[REST API]
    end
    
    A --> G
    A --> H
    A --> I
    
    subgraph "Storage"
        J[Logs]
        K[Plugins]
        L[Connections]
    end
    
    E --> J
    E --> K
    E --> L
    
    subgraph "Executors"
        M[Sequential Executor]
        N[Local Executor]
        O[Celery Executor]
        P[Kubernetes Executor]
    end
    
    C --> M
    C --> N
    C --> O
    C --> P
```

### 1.2 Key Airflow Components 🗝️

#### Scheduler ⏲️
- Heart of Airflow system
- Reads DAG files and schedules tasks
- Monitors task dependencies and triggers execution
- Manages task state transitions

#### Web Server 🌐
- Provides the Airflow UI
- Serves the REST API
- Allows monitoring and manual task management
- User authentication and authorization

#### Executor ⚙️
- Determines how tasks are executed
- Manages worker processes/containers
- Handles task queuing and distribution

#### Metadata Database 🗄️
- Stores all Airflow metadata
- DAG runs, task instances, connections, variables
- Supports PostgreSQL, MySQL, SQLite

### 1.3 DAG (Directed Acyclic Graph) Fundamentals 🕸️

A DAG represents a workflow where:
- **Directed**: Tasks have a defined direction/flow ➡️
- **Acyclic**: No circular dependencies 🔄🚫
- **Graph**: Collection of tasks with dependencies 🧮

```mermaid
graph LR
    A[Extract Data] --> B[Transform Data]
    B --> C[Load to Warehouse]
    B --> D[Generate Report]
    C --> E[Data Quality Check]
    D --> E
    E --> F[Send Notification]
    
    subgraph "DAG Properties"
        G[dag_id: unique identifier]
        H[schedule_interval: when to run]
        I[start_date: when DAG becomes active]
        J[catchup: historical runs]
        K[max_active_runs: concurrency limit]
    end
```

### 1.4 Task Lifecycle and States 🔄

```mermaid
stateDiagram-v2
    [*] --> none: Task Created
    none --> scheduled: Scheduler picks up
    scheduled --> queued: Sent to executor
    queued --> running: Worker starts execution
    running --> success: Task completes successfully
    running --> failed: Task encounters error
    running --> retry: Task fails but has retries
    retry --> queued: Retry attempt
    scheduled --> skipped: Dependency condition not met
    running --> up_for_retry: Temporary failure
    up_for_retry --> queued: After retry delay
    success --> [*]
    failed --> [*]
    skipped --> [*]
```

### 1.5 Airflow Variables and Connections 🔐

#### Variables 📝
- Key-value pairs stored in metadata database
- Environment-specific configurations
- Accessible in DAGs and tasks

```python
from airflow.models import Variable

# Retrieve variable
api_key = Variable.get("api_key")
config = Variable.get("config", deserialize_json=True)
```

#### Connections 🌉
- Store external system credentials
- Database connections, API endpoints, cloud services
- Managed through UI or programmatically

```python
from airflow.hooks.base import BaseHook

# Get connection
conn = BaseHook.get_connection('my_database')
```

---

## Domain 2: DAG Development & Best Practices (30%) 🛠️

### 2.1 Basic DAG Structure 🏗️

```python
from datetime import datetime, timedelta
from airflow import DAG
from airflow.operators.python import PythonOperator
from airflow.operators.bash import BashOperator

# Default arguments for all tasks
default_args = {
    'owner': 'data-team',
    'depends_on_past': False,
    'start_date': datetime(2024, 1, 1),
    'email_on_failure': True,
    'email_on_retry': False,
    'retries': 2,
    'retry_delay': timedelta(minutes=5),
    'execution_timeout': timedelta(hours=2)
}

# DAG definition
dag = DAG(
    'data_pipeline_example',
    default_args=default_args,
    description='Example data pipeline',
    schedule_interval='0 6 * * *',  # Daily at 6 AM
    catchup=False,
    max_active_runs=1,
    tags=['data-engineering', 'etl']
)
```

### 2.2 Essential Operators 🧰

```mermaid
graph TD
    A[Airflow Operators] --> B[Core Operators]
    A --> C[Provider Operators]
    A --> D[Custom Operators]
    
    B --> E[PythonOperator]
    B --> F[BashOperator]
    B --> G[SqlOperator]
    B --> H[EmailOperator]
    B --> I[DummyOperator]
    
    C --> J[S3Operator]
    C --> K[PostgresOperator]
    C --> L[DockerOperator]
    C --> M[KubernetesOperator]
    
    D --> N[CustomPythonOperator]
    D --> O[APIOperator]
    D --> P[DataQualityOperator]
```

#### Python Operator Example 🐍
```python
def extract_data(**context):
    """Extract data from source system"""
    execution_date = context['execution_date']
    # Data extraction logic
    return f"Data extracted for {execution_date}"

extract_task = PythonOperator(
    task_id='extract_data',
    python_callable=extract_data,
    dag=dag
)
```

#### Bash Operator Example 🖥️
```python
cleanup_task = BashOperator(
    task_id='cleanup_temp_files',
    bash_command='rm -rf /tmp/airflow_temp/*',
    dag=dag
)
```

### 2.3 Task Dependencies and Control Flow 🔗

```python
# Linear dependencies
task_a >> task_b >> task_c

# Branching
task_a >> [task_b, task_c] >> task_d

# Using set_upstream/set_downstream
task_a.set_downstream(task_b)
task_b.set_upstream(task_a)

# Complex dependencies
extract_task >> [transform_task, validate_task]
[transform_task, validate_task] >> load_task
```

### 2.4 DAG Scheduling and Intervals ⏳

```python
# Schedule expressions
schedule_options = {
    'hourly': '0 * * * *',
    'daily': '0 6 * * *',
    'weekly': '0 6 * * 1',  # Monday 6 AM
    'monthly': '0 6 1 * *',  # 1st day of month
    'yearly': '0 6 1 1 *',   # January 1st
    'none': None,            # Manual only
    'once': '@once',         # Run once
    'continuous': timedelta(minutes=10)  # Every 10 minutes
}
```

### 2.5 XComs (Cross-Communication) 📬

XComs enable task-to-task communication by passing small pieces of data.

```python
def push_data(**context):
    """Push data to XCom"""
    data = {"processed_records": 1000, "status": "success"}
    return data  # Automatically pushed to XCom

def pull_data(**context):
    """Pull data from XCom"""
    ti = context['task_instance']
    data = ti.xcom_pull(task_ids='push_task')
    print(f"Received: {data}")

push_task = PythonOperator(
    task_id='push_task',
    python_callable=push_data,
    dag=dag
)

pull_task = PythonOperator(
    task_id='pull_task',
    python_callable=pull_data,
    dag=dag
)

push_task >> pull_task
```

### 2.6 Templating and Macros 🧩

Airflow supports Jinja2 templating for dynamic values:

```python
# Template fields example
templated_command = """
    echo "Processing data for {{ ds }}"
    echo "Execution date: {{ execution_date }}"
    echo "Previous execution: {{ prev_execution_date }}"
    echo "Next execution: {{ next_execution_date }}"
"""

templated_task = BashOperator(
    task_id='templated_task',
    bash_command=templated_command,
    dag=dag
)

# Custom macros
def custom_macro(execution_date):
    return execution_date.strftime('%Y%m%d')

dag.user_defined_macros = {
    'custom_date_format': custom_macro
}
```

---

## Domain 3: Task Management & Dependencies (20%) 🔗

### 3.1 Task Dependencies Patterns 🧬

```mermaid
graph TD
    A[Sequential Pattern] --> B[Task 1] --> C[Task 2] --> D[Task 3]
    
    E[Fan-out Pattern] --> F[Source Task]
    F --> G[Task A]
    F --> H[Task B]
    F --> I[Task C]
    
    J[Fan-in Pattern] --> K[Task X]
    J --> L[Task Y]
    J --> M[Task Z]
    K --> N[Merge Task]
    L --> N
    M --> N
    
    O[Diamond Pattern] --> P[Start]
    P --> Q[Branch A]
    P --> R[Branch B]
    Q --> S[Join]
    R --> S
```

### 3.2 Conditional Logic and Branching 🌳

```python
from airflow.operators.python import BranchPythonOperator
from airflow.operators.dummy import DummyOperator

def choose_branch(**context):
    """Conditional logic for branching"""
    execution_date = context['execution_date']
    if execution_date.weekday() < 5:  # Weekday
        return 'weekday_task'
    else:
        return 'weekend_task'

branch_task = BranchPythonOperator(
    task_id='branch_decision',
    python_callable=choose_branch,
    dag=dag
)

weekday_task = DummyOperator(
    task_id='weekday_task',
    dag=dag
)

weekend_task = DummyOperator(
    task_id='weekend_task',
    dag=dag
)

# Join after branching
join_task = DummyOperator(
    task_id='join_task',
    trigger_rule='none_failed_or_skipped',
    dag=dag
)

branch_task >> [weekday_task, weekend_task] >> join_task
```

### 3.3 Trigger Rules 🎯

```python
trigger_rules = {
    'all_success': 'All upstream tasks successful (default)',
    'all_failed': 'All upstream tasks failed',
    'all_done': 'All upstream tasks completed',
    'one_success': 'At least one upstream task successful',
    'one_failed': 'At least one upstream task failed',
    'none_failed': 'No upstream tasks failed',
    'none_failed_or_skipped': 'No upstream tasks failed or skipped',
    'none_skipped': 'No upstream tasks skipped',
    'dummy': 'Dependencies ignored'
}

# Example usage
cleanup_task = BashOperator(
    task_id='cleanup',
    bash_command='echo "Cleaning up resources"',
    trigger_rule='all_done',  # Run regardless of upstream success/failure
    dag=dag
)
```

### 3.4 Task Groups 🗂️

```python
from airflow.utils.task_group import TaskGroup

with TaskGroup("data_processing", dag=dag) as processing_group:
    
    extract = PythonOperator(
        task_id='extract',
        python_callable=extract_function
    )
    
    transform = PythonOperator(
        task_id='transform',
        python_callable=transform_function
    )
    
    validate = PythonOperator(
        task_id='validate',
        python_callable=validate_function
    )
    
    extract >> transform >> validate

# Task group in DAG flow
start_task >> processing_group >> end_task
```

### 3.5 Dynamic Task Generation 🧑‍💻

```python
def create_dynamic_tasks():
    """Generate tasks dynamically"""
    sources = ['db1', 'db2', 'db3', 'api1', 'api2']
    
    for source in sources:
        task = PythonOperator(
            task_id=f'process_{source}',
            python_callable=process_source,
            op_kwargs={'source_name': source},
            dag=dag
        )
        
        # Set dependencies
        start_task >> task >> end_task

create_dynamic_tasks()
```

---

## Domain 4: Airflow UI & Monitoring (15%) 👀

### 4.1 Airflow Web UI Navigation 🖥️

```mermaid
graph TD
    A[Airflow Web UI] --> B[DAGs View]
    A --> C[Task Instances]
    A --> D[Logs]
    A --> E[Admin]
    A --> F[Browse]
    
    B --> G[DAG List]
    B --> H[DAG Details]
    B --> I[Graph View]
    B --> J[Tree View]
    B --> K[Gantt Chart]
    
    C --> L[Task Instance List]
    C --> M[Task Details]
    C --> N[Task Logs]
    
    E --> O[Connections]
    E --> P[Variables]
    E --> Q[Pools]
    E --> R[Configuration]
    
    F --> S[XComs]
    F --> T[SLA Misses]
    F --> U[Job Status]
```

### 4.2 DAG Views and Insights 🔍

#### Graph View 🕸️
- Visual representation of DAG structure
- Task dependencies and relationships
- Task status color coding
- Real-time execution state

#### Tree View 🌲
- Historical DAG runs in timeline format
- Task instance states across multiple runs
- Quick identification of patterns and issues

#### Gantt Chart 📊
- Task execution timeline
- Duration and overlap analysis
- Resource utilization insights
- Performance optimization opportunities

### 4.3 Log Management and Debugging 🪵

```python
import logging
from airflow.utils.log.logging_mixin import LoggingMixin

class CustomOperator(BaseOperator, LoggingMixin):
    def execute(self, context):
        self.log.info("Starting task execution")
        self.log.warning("This is a warning message")
        self.log.error("Error occurred in processing")
        
        # Debug information
        self.log.debug(f"Context: {context}")
        
        return "Task completed"
```

### 4.4 Monitoring Best Practices 🩺

#### Health Checks 🏥
```python
def health_check(**context):
    """Perform system health checks"""
    checks = {
        'database_connection': check_database(),
        'external_api': check_api_availability(),
        'disk_space': check_disk_space(),
        'memory_usage': check_memory()
    }
    
    for check_name, status in checks.items():
        if not status:
            raise Exception(f"Health check failed: {check_name}")
    
    return "All systems healthy"

health_task = PythonOperator(
    task_id='health_check',
    python_callable=health_check,
    dag=dag
)
```

#### SLA Monitoring ⏱️
```python
# DAG-level SLA
dag = DAG(
    'critical_pipeline',
    default_args=default_args,
    sla_miss_callback=sla_miss_callback,
    schedule_interval='@hourly'
)

# Task-level SLA
critical_task = PythonOperator(
    task_id='critical_processing',
    python_callable=process_data,
    sla=timedelta(minutes=30),
    dag=dag
)
```

---

## Domain 5: Deployment & Operations (10%) 🚦

### 5.1 Airflow Deployment Architectures 🏢

```mermaid
graph TD
    A[Single Node] --> B[All components on one machine]
    B --> C[Sequential/Local Executor]
    B --> D[SQLite/PostgreSQL]
    
    E[Multi-Node] --> F[Distributed components]
    F --> G[Celery Executor]
    F --> H[Redis/RabbitMQ]
    F --> I[Multiple Workers]
    
    J[Kubernetes] --> K[Container orchestration]
    K --> L[Kubernetes Executor]
    K --> M[Pod-based workers]
    K --> N[Auto-scaling]
    
    O[Cloud Managed] --> P[Astronomer Cloud]
    O --> Q[Google Cloud Composer]
    O --> R[Amazon MWAA]
    O --> S[Azure Data Factory]
```

### 5.2 Configuration Management ⚙️

#### airflow.cfg Key Settings
```ini
[core]
dags_folder = /opt/airflow/dags
base_log_folder = /opt/airflow/logs
executor = LocalExecutor
sql_alchemy_conn = postgresql://user:pass@localhost/airflow
parallelism = 32
max_active_runs_per_dag = 16

[scheduler]
dag_dir_list_interval = 300
max_threads = 2
catchup_by_default = False

[webserver]
web_server_port = 8080
secret_key = your_secret_key
expose_config = False
```

### 5.3 Environment Management 🌎

```python
import os
from airflow.models import Variable

# Environment-specific configurations
ENVIRONMENT = os.getenv('AIRFLOW_ENV', 'development')

if ENVIRONMENT == 'production':
    DATABASE_CONN = Variable.get('prod_database_conn')
    EMAIL_ALERTS = True
    RETRIES = 3
elif ENVIRONMENT == 'staging':
    DATABASE_CONN = Variable.get('staging_database_conn')
    EMAIL_ALERTS = False
    RETRIES = 2
else:
    DATABASE_CONN = Variable.get('dev_database_conn')
    EMAIL_ALERTS = False
    RETRIES = 1
```

### 5.4 Security Best Practices 🛡️

#### Access Control 🔒
- Role-based access control (RBAC)
- User authentication (LDAP, OAuth)
- Connection encryption
- Secret management

#### DAG Security 🕵️‍♂️
```python
# Secure connections usage
from airflow.hooks.postgres_hook import PostgresHook

def secure_data_access():
    """Use hooks for secure database access"""
    pg_hook = PostgresHook(postgres_conn_id='secure_db_conn')
    
    # Parameterized queries to prevent SQL injection
    sql = "SELECT * FROM users WHERE created_date >= %s"
    records = pg_hook.get_records(sql, parameters=[context['ds']])
    
    return len(records)
```

---

## Advanced Topics and Best Practices 🌟

### Error Handling and Recovery 🩹

```python
from airflow.exceptions import AirflowException, AirflowSkipException

def robust_task(**context):
    """Task with comprehensive error handling"""
    try:
        # Main task logic
        result = perform_operation()
        
        # Validation
        if not validate_result(result):
            raise AirflowException("Data validation failed")
            
        return result
        
    except ConnectionError as e:
        # Retry for connection issues
        context['task_instance'].log.warning(f"Connection error: {e}")
        raise  # Will trigger retry
        
    except ValueError as e:
        # Skip for data quality issues
        context['task_instance'].log.info(f"Skipping due to data issue: {e}")
        raise AirflowSkipException("Invalid data format")
        
    except Exception as e:
        # Log and fail for unexpected errors
        context['task_instance'].log.error(f"Unexpected error: {e}")
        send_alert_notification(str(e))
        raise AirflowException(f"Task failed: {e}")
```

### Performance Optimization ⚡

```mermaid
graph LR
    A[Performance Optimization] --> B[DAG Design]
    A --> C[Task Optimization]
    A --> D[Resource Management]
    A --> E[Infrastructure]
    
    B --> F[Minimize DAG complexity]
    B --> G[Efficient dependencies]
    B --> H[Task grouping]
    
    C --> I[Parallel execution]
    C --> J[Efficient operators]
    C --> K[Resource allocation]
    
    D --> L[Connection pooling]
    D --> M[Memory management]
    D --> N[Executor tuning]
    
    E --> O[Scaling workers]
    E --> P[Database optimization]
    E --> Q[Network optimization]
```

### Testing Strategies 🧪

```python
import unittest
from airflow.models import DagBag
from datetime import datetime

class TestDataPipelineDAG(unittest.TestCase):
    
    def setUp(self):
        self.dagbag = DagBag()
        
    def test_dag_loaded(self):
        """Test DAG loads without errors"""
        dag = self.dagbag.get_dag(dag_id='data_pipeline_example')
        self.assertIsNotNone(dag)
        
    def test_dag_structure(self):
        """Test DAG has expected tasks"""
        dag = self.dagbag.get_dag(dag_id='data_pipeline_example')
        expected_tasks = ['extract_data', 'transform_data', 'load_data']
        
        for task_id in expected_tasks:
            self.assertIn(task_id, dag.task_ids)
            
    def test_task_dependencies(self):
        """Test task dependencies are correct"""
        dag = self.dagbag.get_dag(dag_id='data_pipeline_example')
        extract_task = dag.get_task('extract_data')
        transform_task = dag.get_task('transform_data')
        
        self.assertIn(transform_task, extract_task.downstream_list)
```

---

## Practice Questions ❓

### Question 1
What is the main purpose of the Airflow Scheduler?  
A) Execute tasks directly  
B) Provide the web interface  
C) Monitor DAG files and schedule tasks  
D) Store task logs  

**Answer: C** - The Scheduler monitors DAG files, manages task dependencies, and schedules tasks for execution. 🗓️

### Question 2
Which trigger rule would you use for a cleanup task that should run regardless of upstream task success or failure?  
A) all_success  
B) all_failed  
C) all_done  
D) one_success  

**Answer: C** - `all_done` ensures the task runs when all upstream tasks complete, regardless of their state. 🧹

### Question 3
What is the correct way to pass data between tasks in Airflow?  
A) Global variables  
B) File system  
C) XComs  
D) Database tables  

**Answer: C** - XComs (Cross-Communications) are the built-in mechanism for passing small amounts of data between tasks. 📬

### Question 4
Which scheduling expression represents running a DAG daily at 2:30 AM?  
A) `30 2 * * *`  
B) `0 2 * * *`  
C) `30 14 * * *`  
D) `2 30 * * *`  

**Answer: A** - `30 2 * * *` means 30 minutes past 2 AM daily (minute hour day month dayofweek). ⏰

### Question 5
What happens when `catchup=True` in a DAG definition?  
A) The DAG will retry failed tasks automatically  
B) Airflow will run missed DAG runs for dates between start_date and current date  
C) The DAG will skip weekends  
D) The DAG will run continuously  

**Answer: B** - When catchup=True, Airflow schedules and runs all missed DAG runs between start_date and current date. ⏳

### Question 6
Which executor is best for development and testing?  
A) CeleryExecutor  
B) KubernetesExecutor  
C) SequentialExecutor  
D) LocalExecutor  

**Answer: C** - SequentialExecutor runs tasks one at a time and is ideal for development/testing with minimal resource requirements. 🧑‍💻

### Question 7
How do you access an Airflow Variable in a DAG?  
A) `os.environ['VARIABLE_NAME']`  
B) `Variable.get('variable_name')`  
C) `context['variables']['variable_name']`  
D) `airflow.get_variable('variable_name')`  

**Answer: B** - `Variable.get('variable_name')` is the correct method to retrieve Airflow Variables. 📝

### Question 8
What is the purpose of Task Groups in Airflow?  
A) Execute tasks in parallel  
B) Organize and group related tasks visually  
C) Share variables between tasks  
D) Handle task failures  

**Answer: B** - Task Groups provide visual organization of related tasks in the DAG graph without affecting execution logic. 🗂️

### Question 9
Which view in the Airflow UI shows task execution timeline and duration?  
A) Graph View  
B) Tree View  
C) Gantt Chart  
D) Code View  

**Answer: C** - Gantt Chart displays task execution timeline, duration, and overlaps for performance analysis. 📊

### Question 10
What is the recommended approach for handling sensitive information like passwords in Airflow?  
A) Store in DAG files  
B) Use environment variables  
C) Use Airflow Connections  
D) Hardcode in tasks  

**Answer: C** - Airflow Connections provide secure storage and management of sensitive credentials and connection information. 🔐

---

## Study Resources and Next Steps 📚

### Official Documentation
- [Apache Airflow Documentation](https://airflow.apache.org/docs/) 📖
- [Astronomer Documentation](https://docs.astronomer.io/) 🌠
- [Airflow Best Practices](https://airflow.apache.org/docs/apache-airflow/stable/best-practices.html) 🏅

### Hands-on Practice 🏋️‍♂️
1. **Set up local Airflow environment**
   ```bash
   pip install apache-airflow
   airflow db init
   airflow users create --username admin --password admin --firstname Admin --lastname User --role Admin --email admin@example.com
   ```

2. **Create practice DAGs**
   - Simple ETL pipeline 🧃
   - Data validation workflow ✅
   - Multi-source data integration 🔗
   - Error handling scenarios 🩹

3. **Explore Airflow UI**
   - Navigate different views 🖥️
   - Monitor task execution 👀
   - Analyze logs and performance 📊
   - Configure connections and variables 🔐

### Advanced Learning Path 🚀
1. **Complete this fundamentals certification**
2. **Gain hands-on experience with real projects** 🏗️
3. **Learn advanced topics:**
   - Custom operators and hooks 🧩
   - Airflow plugins 🔌
   - Advanced scheduling patterns ⏳
   - Production deployment strategies 🚦
4. **Consider advanced certifications:**
   - DAG Authoring certification
   - Airflow for Data Engineers
   - Cloud-specific Airflow services ☁️

### Key Success Tips 🏆
- **Practice regularly** with different DAG patterns
- **Understand core concepts** deeply rather than memorizing
- **Focus on real-world scenarios** and practical applications
- **Learn from errors** and troubleshooting
- **Stay updated** with Airflow releases and new features

Good luck with your Apache Airflow Fundamentals certification! 🎉🚀

---

*Last updated: July 29, 2025 | Study guide version: 1.0* 😊
