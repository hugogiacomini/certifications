# Databricks Fundamentals for Data Engineer Associate

## Overview
This section covers the foundational concepts of the Databricks platform, including workspace navigation, cluster management, and core architecture components essential for data engineering tasks.

## 1. Databricks Platform Architecture

### 1.1 Control Plane vs Data Plane

```mermaid
flowchart LR
    subgraph "Control Plane (Databricks Managed)"
        WebApp["`**Web Application**
        • Workspace UI
        • Notebook interface
        • Job scheduler
        • Cluster manager`"]
        
        RestAPI["`**REST APIs**
        • Workspace API
        • Clusters API
        • Jobs API
        • DBFS API`"]
        
        Metastore["`**Hive Metastore**
        • Table metadata
        • Schema information
        • Data location
        • Access permissions`"]
    end
    
    subgraph "Data Plane (Customer VPC/Cloud)"
        Compute["`**Compute Resources**
        • Driver node
        • Worker nodes
        • Spark clusters
        • Auto-scaling`"]
        
        Storage["`**Storage Systems**
        • Cloud storage (S3/ADLS/GCS)
        • DBFS (Databricks File System)
        • Local SSD storage
        • Delta Lake tables`"]
        
        Network["`**Networking**
        • VPC/VNet configuration
        • Security groups
        • Private subnets
        • NAT gateways`"]
    end
    
    WebApp --> Compute
    RestAPI --> Storage
    Metastore --> Network
    
    classDef controlClass fill:#4ecdc4,stroke:#45b7af,color:#fff
    classDef dataClass fill:#ff6b6b,stroke:#ee5a52,color:#fff
    
    class WebApp,RestAPI,Metastore controlClass
    class Compute,Storage,Network dataClass
```

### 1.2 Databricks Runtime Components

```mermaid
flowchart LR
    subgraph "Databricks Runtime"
        ApacheSpark["`**Apache Spark**
        • Distributed computing engine
        • In-memory processing
        • SQL, Python, Scala, R
        • Machine learning libraries`"]
        
        DeltaLake["`**Delta Lake**
        • ACID transactions
        • Schema enforcement
        • Time travel
        • Unified batch and streaming`"]
        
        MLflow["`**MLflow**
        • ML lifecycle management
        • Experiment tracking
        • Model registry
        • Model deployment`"]
        
        Libraries["`**Optimized Libraries**
        • Photon engine
        • Koalas (pandas API)
        • Hyperopt
        • Custom libraries`"]
    end
    
    subgraph "Language Support"
        SQL["`**SQL**
        • ANSI SQL support
        • Delta Lake operations
        • Built-in functions
        • Performance optimization`"]
        
        Python["`**Python**
        • PySpark API
        • Pandas integration
        • NumPy, SciPy
        • Data science libraries`"]
        
        Scala["`**Scala**
        • Native Spark language
        • Type safety
        • Functional programming
        • High performance`"]
        
        R["`**R**
        • SparkR package
        • Statistical computing
        • Data visualization
        • Specialized analytics`"]
    end
    
    ApacheSpark --> SQL
    DeltaLake --> Python
    MLflow --> Scala
    Libraries --> R
    
    classDef runtimeClass fill:#96ceb4,stroke:#85b894,color:#fff
    classDef languageClass fill:#feca57,stroke:#ff9f43,color:#fff
    
    class ApacheSpark,DeltaLake,MLflow,Libraries runtimeClass
    class SQL,Python,Scala,R languageClass
```

**Reference**: [Databricks Platform Architecture](https://docs.databricks.com/getting-started/overview.html)

## 2. Workspace and Cluster Management

### 2.1 Workspace Organization

#### Workspace Structure
- **Workspace**: Top-level container for all Databricks assets
- **Folders**: Organize notebooks, libraries, and other objects
- **Notebooks**: Interactive development environment
- **Repos**: Git integration for version control

#### Best Practices for Workspace Organization
```python
# Example workspace structure
"""
/Workspace
├── /Shared
│   ├── /data-engineering
│   │   ├── /bronze-layer
│   │   ├── /silver-layer
│   │   └── /gold-layer
│   ├── /data-science
│   └── /shared-libraries
├── /Users
│   └── /user@company.com
│       ├── /development
│       ├── /testing
│       └── /experiments
└── /Repos
    └── /user@company.com
        └── /data-pipeline-project
"""
```

### 2.2 Cluster Configuration and Management

```mermaid
flowchart LR
    subgraph "Cluster Types"
        AllPurpose["`**All-Purpose Clusters**
        • Interactive development
        • Ad-hoc analysis
        • Manual start/stop
        • Shared among users`"]
        
        JobClusters["`**Job Clusters**
        • Automated job execution
        • Ephemeral lifecycle
        • Cost-optimized
        • Single-purpose workloads`"]
        
        PoolClusters["`**Pool Clusters**
        • Pre-warmed instances
        • Faster start times
        • Resource sharing
        • Idle instance management`"]
    end
    
    subgraph "Configuration Options"
        NodeTypes["`**Node Types**
        • Driver node specification
        • Worker node types
        • Memory and CPU selection
        • GPU support options`"]
        
        AutoScale["`**Auto Scaling**
        • Min/max worker nodes
        • Dynamic scaling
        • Cost optimization
        • Workload adaptation`"]
        
        Runtime["`**Runtime Version**
        • Databricks Runtime
        • ML Runtime
        • Photon acceleration
        • Custom configurations`"]
    end
    
    subgraph "Advanced Settings"
        SparkConfig["`**Spark Configuration**
        • Memory settings
        • Parallelism tuning
        • Serialization options
        • Custom properties`"]
        
        InitScripts["`**Init Scripts**
        • Environment setup
        • Library installation
        • Security configuration
        • Custom initialization`"]
        
        AccessControl["`**Access Control**
        • User permissions
        • Cluster policies
        • Security groups
        • Network isolation`"]
    end
    
    AllPurpose --> NodeTypes
    JobClusters --> AutoScale
    PoolClusters --> Runtime
    
    NodeTypes --> SparkConfig
    AutoScale --> InitScripts
    Runtime --> AccessControl
    
    classDef clusterClass fill:#ff6b6b,stroke:#ee5a52,color:#fff
    classDef configClass fill:#4ecdc4,stroke:#45b7af,color:#fff
    classDef advancedClass fill:#45b7d1,stroke:#3a9bc1,color:#fff
    
    class AllPurpose,JobClusters,PoolClusters clusterClass
    class NodeTypes,AutoScale,Runtime configClass
    class SparkConfig,InitScripts,AccessControl advancedClass
```

#### Cluster Creation Example
```python
# Create cluster via REST API
import requests
import json

cluster_config = {
    "cluster_name": "data-engineering-cluster",
    "spark_version": "13.3.x-scala2.12",
    "node_type_id": "i3.xlarge",
    "driver_node_type_id": "i3.xlarge",
    "num_workers": 2,
    "autoscale": {
        "min_workers": 1,
        "max_workers": 8
    },
    "auto_termination_minutes": 60,
    "spark_conf": {
        "spark.sql.adaptive.enabled": "true",
        "spark.sql.adaptive.coalescePartitions.enabled": "true"
    },
    "custom_tags": {
        "team": "data-engineering",
        "project": "etl-pipeline"
    }
}
```

**Reference**: [Cluster Configuration](https://docs.databricks.com/clusters/configure.html)

## 3. Databricks File System (DBFS)

### 3.1 DBFS Architecture and Usage

```mermaid
flowchart LR
    subgraph "DBFS Components"
        DBFSRoot["`**DBFS Root**
        • /databricks-datasets
        • /databricks-results
        • /FileStore
        • /tmp directories`"]
        
        MountPoints["`**Mount Points**
        • Cloud storage integration
        • External data sources
        • S3, ADLS, GCS access
        • Credential management`"]
        
        LocalStorage["`**Local Storage**
        • Cluster local files
        • Temporary processing
        • Driver node storage
        • Worker node cache`"]
    end
    
    subgraph "Access Methods"
        DBFSCommands["`**DBFS Commands**
        • %fs magic commands
        • dbutils.fs utilities
        • File operations
        • Directory management`"]
        
        SparkAPI["`**Spark API**
        • spark.read methods
        • DataFrame operations
        • Path specifications
        • Format options`"]
        
        CLIAccess["`**CLI Access**
        • Databricks CLI
        • File upload/download
        • Batch operations
        • Automation scripts`"]
    end
    
    DBFSRoot --> DBFSCommands
    MountPoints --> SparkAPI
    LocalStorage --> CLIAccess
    
    classDef componentClass fill:#96ceb4,stroke:#85b894,color:#fff
    classDef accessClass fill:#feca57,stroke:#ff9f43,color:#fff
    
    class DBFSRoot,MountPoints,LocalStorage componentClass
    class DBFSCommands,SparkAPI,CLIAccess accessClass
```

#### Common DBFS Operations
```python
# File system operations using dbutils
# List files in directory
dbutils.fs.ls("/databricks-datasets")

# Copy files
dbutils.fs.cp("/tmp/source.csv", "/FileStore/destination.csv")

# Remove files
dbutils.fs.rm("/tmp/temp_file.txt")

# Create directory
dbutils.fs.mkdirs("/tmp/new_directory")

# Mount external storage
dbutils.fs.mount(
    source="s3a://bucket-name/path",
    mount_point="/mnt/s3-data",
    extra_configs={"fs.s3a.access.key": access_key,
                   "fs.s3a.secret.key": secret_key}
)
```

#### Working with Files in Spark
```python
# Read files from DBFS
df = spark.read.option("header", "true").csv("/databricks-datasets/retail-org/customers/customers.csv")

# Write files to DBFS
df.write.mode("overwrite").parquet("/tmp/processed_data")

# Read from mounted storage
df_external = spark.read.json("/mnt/s3-data/json-files/")
```

**Reference**: [Databricks File System](https://docs.databricks.com/dbfs/index.html)

## 4. Notebooks and Development Environment

### 4.1 Notebook Features and Best Practices

#### Notebook Cell Types
- **Code Cells**: Execute code in supported languages
- **Markdown Cells**: Documentation and explanations
- **SQL Cells**: Direct SQL execution
- **Shell Cells**: System commands and file operations

#### Magic Commands
```python
# Language magic commands
%python    # Switch to Python
%sql       # Execute SQL
%scala     # Switch to Scala
%r         # Switch to R
%sh        # Execute shell commands

# File system magic commands
%fs ls /databricks-datasets
%fs head /path/to/file.txt

# Other useful magic commands
%run ./helper_notebook    # Run another notebook
%pip install package     # Install Python packages
%conda install package   # Install via conda
```

### 4.2 Collaborative Features

```mermaid
flowchart LR
    subgraph "Collaboration Tools"
        VersionControl["`**Version Control**
        • Git integration
        • Revision history
        • Branch management
        • Merge capabilities`"]
        
        Sharing["`**Notebook Sharing**
        • Permission management
        • Comment system
        • Real-time collaboration
        • Export options`"]
        
        Documentation["`**Documentation**
        • Markdown support
        • Rich text formatting
        • Embedded visualizations
        • Code explanations`"]
    end
    
    subgraph "Development Workflow"
        Development["`**Development**
        • Interactive coding
        • Cell-by-cell execution
        • Variable inspection
        • Debugging support`"]
        
        Testing["`**Testing**
        • Unit test integration
        • Data validation
        • Quality checks
        • Error handling`"]
        
        Production["`**Production**
        • Notebook jobs
        • Scheduled execution
        • Parameter passing
        • Monitoring`"]
    end
    
    VersionControl --> Development
    Sharing --> Testing
    Documentation --> Production
    
    classDef collabClass fill:#ff6b6b,stroke:#ee5a52,color:#fff
    classDef workflowClass fill:#4ecdc4,stroke:#45b7af,color:#fff
    
    class VersionControl,Sharing,Documentation collabClass
    class Development,Testing,Production workflowClass
```

#### Notebook Parameter Usage
```python
# Define parameters using widgets
dbutils.widgets.text("input_path", "/databricks-datasets/retail-org/customers/")
dbutils.widgets.dropdown("output_format", "parquet", ["parquet", "delta", "csv"])

# Get parameter values
input_path = dbutils.widgets.get("input_path")
output_format = dbutils.widgets.get("output_format")

# Use parameters in processing
df = spark.read.csv(input_path, header=True)
df.write.format(output_format).save("/tmp/processed_output")
```

**Reference**: [Databricks Notebooks](https://docs.databricks.com/notebooks/index.html)

## 5. Basic Security and Access Control

### 5.1 Workspace Security Model

```mermaid
flowchart LR
    subgraph "Authentication"
        UserAuth["`**User Authentication**
        • Email/password
        • SSO integration
        • OAuth providers
        • Service principals`"]
        
        TokenAuth["`**Token Authentication**
        • Personal access tokens
        • API authentication
        • Programmatic access
        • Expiration management`"]
    end
    
    subgraph "Authorization"
        WorkspacePerms["`**Workspace Permissions**
        • Admin users
        • Regular users
        • Read-only access
        • Custom roles`"]
        
        ObjectPerms["`**Object Permissions**
        • Notebook access
        • Folder permissions
        • Cluster access
        • Job permissions`"]
        
        DataPerms["`**Data Permissions**
        • Table access control
        • Column-level security
        • Row-level security
        • Dynamic views`"]
    end
    
    UserAuth --> WorkspacePerms
    TokenAuth --> ObjectPerms
    WorkspacePerms --> DataPerms
    
    classDef authClass fill:#ff6b6b,stroke:#ee5a52,color:#fff
    classDef authzClass fill:#4ecdc4,stroke:#45b7af,color:#fff
    
    class UserAuth,TokenAuth authClass
    class WorkspacePerms,ObjectPerms,DataPerms authzClass
```

### 5.2 Basic Access Control Implementation

#### Workspace-Level Access Control
```sql
-- Grant workspace admin privileges
GRANT CREATE, USAGE ON SCHEMA default TO `admin-group@company.com`;

-- Grant read-only access to specific tables
GRANT SELECT ON TABLE customer_data TO `analysts@company.com`;

-- Create custom roles
CREATE ROLE data_engineer;
GRANT CREATE TABLE, CREATE VIEW ON SCHEMA analytics TO ROLE data_engineer;
GRANT ROLE data_engineer TO `de-team@company.com`;
```

#### Cluster Access Control
```python
# Cluster policy example (JSON format)
cluster_policy = {
    "spark_version": {
        "type": "fixed",
        "value": "13.3.x-scala2.12"
    },
    "node_type_id": {
        "type": "allowlist",
        "values": ["i3.xlarge", "i3.2xlarge"]
    },
    "autotermination_minutes": {
        "type": "range",
        "min": 10,
        "max": 180
    },
    "custom_tags.team": {
        "type": "fixed",
        "value": "data-engineering"
    }
}
```

**Reference**: [Databricks Security](https://docs.databricks.com/security/index.html)

## 6. Jobs and Workflow Management

### 6.1 Job Types and Configuration

```mermaid
flowchart LR
    subgraph "Job Types"
        NotebookJob["`**Notebook Jobs**
        • Single notebook execution
        • Parameter passing
        • Output capture
        • Error handling`"]
        
        JARJob["`**JAR Jobs**
        • Scala/Java applications
        • Main class execution
        • Library dependencies
        • Custom applications`"]
        
        PythonJob["`**Python Jobs**
        • Python script execution
        • Package dependencies
        • Environment management
        • Custom modules`"]
        
        SQLJob["`**SQL Jobs**
        • SQL script execution
        • Query optimization
        • Result management
        • Data validation`"]
    end
    
    subgraph "Scheduling Options"
        Manual["`**Manual Execution**
        • On-demand runs
        • Immediate execution
        • Ad-hoc processing
        • Development testing`"]
        
        Scheduled["`**Scheduled Jobs**
        • Cron expressions
        • Time-based triggers
        • Recurring execution
        • Calendar integration`"]
        
        Triggered["`**Triggered Jobs**
        • Event-based execution
        • File arrival triggers
        • API-based triggers
        • Workflow dependencies`"]
    end
    
    subgraph "Monitoring & Management"
        Logging["`**Job Logging**
        • Execution logs
        • Error tracking
        • Performance metrics
        • Debug information`"]
        
        Alerting["`**Alerting**
        • Failure notifications
        • Success confirmations
        • Performance alerts
        • Custom webhooks`"]
        
        Retries["`**Retry Logic**
        • Automatic retries
        • Exponential backoff
        • Custom retry policies
        • Failure handling`"]
    end
    
    NotebookJob --> Manual
    JARJob --> Scheduled
    PythonJob --> Triggered
    SQLJob --> Manual
    
    Manual --> Logging
    Scheduled --> Alerting
    Triggered --> Retries
    
    classDef jobClass fill:#96ceb4,stroke:#85b894,color:#fff
    classDef scheduleClass fill:#feca57,stroke:#ff9f43,color:#fff
    classDef monitorClass fill:#a55eea,stroke:#8854d0,color:#fff
    
    class NotebookJob,JARJob,PythonJob,SQLJob jobClass
    class Manual,Scheduled,Triggered scheduleClass
    class Logging,Alerting,Retries monitorClass
```

#### Job Creation Example
```python
# Create a notebook job using Jobs API
job_config = {
    "name": "Daily ETL Pipeline",
    "job_clusters": [{
        "job_cluster_key": "etl_cluster",
        "new_cluster": {
            "spark_version": "13.3.x-scala2.12",
            "node_type_id": "i3.xlarge",
            "num_workers": 2,
            "spark_conf": {
                "spark.sql.adaptive.enabled": "true"
            }
        }
    }],
    "tasks": [{
        "task_key": "etl_task",
        "job_cluster_key": "etl_cluster",
        "notebook_task": {
            "notebook_path": "/Shared/etl/daily_pipeline",
            "base_parameters": {
                "date": "{{start_date}}",
                "environment": "production"
            }
        }
    }],
    "schedule": {
        "quartz_cron_expression": "0 0 2 * * ?",  # Daily at 2 AM
        "timezone_id": "UTC"
    },
    "email_notifications": {
        "on_failure": ["de-team@company.com"],
        "on_success": ["manager@company.com"]
    }
}
```

**Reference**: [Databricks Jobs](https://docs.databricks.com/jobs/index.html)

## 7. Best Practices Summary

### 7.1 Development Best Practices
1. **Workspace Organization**: Use clear folder structure and naming conventions
2. **Version Control**: Integrate with Git for code versioning
3. **Documentation**: Include markdown cells for code explanation
4. **Testing**: Implement data validation and unit tests
5. **Parameters**: Use widgets for notebook parameterization

### 7.2 Cluster Management Best Practices
1. **Right-sizing**: Choose appropriate node types for workload
2. **Auto-termination**: Set automatic termination to control costs
3. **Auto-scaling**: Configure appropriate min/max workers
4. **Cluster Policies**: Implement governance and cost control
5. **Monitoring**: Track cluster usage and performance

### 7.3 Security Best Practices
1. **Access Control**: Implement least privilege access
2. **Authentication**: Use SSO and service principals
3. **Data Security**: Encrypt data at rest and in transit
4. **Audit Logging**: Enable comprehensive audit trails
5. **Network Security**: Configure proper VPC/firewall settings

## Conclusion

Understanding Databricks fundamentals is crucial for data engineering success. This foundation covers the platform architecture, workspace management, cluster configuration, and security basics that form the building blocks for more advanced data engineering tasks.

Focus on hands-on practice with workspace navigation, cluster creation, and basic notebook development to build proficiency with the platform before moving to more complex data engineering concepts.
