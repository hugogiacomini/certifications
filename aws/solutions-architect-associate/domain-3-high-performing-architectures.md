# Domain 3: Design High-Performing Architectures (24% of exam)

## Table of Contents
1. [Introduction](#introduction)
2. [High-Performance Computing Solutions](#high-performance-computing-solutions)
3. [Storage Performance Optimization](#storage-performance-optimization)
4. [Database Performance](#database-performance)
5. [Network Performance](#network-performance)
6. [Caching Strategies](#caching-strategies)
7. [Content Delivery and Edge Services](#content-delivery-and-edge-services)
8. [Practice Questions](#practice-questions)
9. [Official Documentation](#official-documentation)

## Introduction

This domain focuses on designing high-performing architectures that meet performance requirements efficiently. You'll learn about compute optimization, storage performance, database tuning, network optimization, and caching strategies.

## High-Performance Computing Solutions

### EC2 Instance Types and Optimization

```mermaid
graph TD
    A[Workload Requirements] --> B{Instance Family}
    
    B --> C[General Purpose - M, T]
    B --> D[Compute Optimized - C]
    B --> E[Memory Optimized - R, X, z1d]
    B --> F[Storage Optimized - I, D, H]
    B --> G[Accelerated Computing - P, G, F]
    
    C --> H[Balanced CPU, Memory, Network]
    D --> I[High-Performance Processors]
    E --> J[Fast Performance for Memory-Intensive]
    F --> K[High Sequential R/W to Local Storage]
    G --> L[Hardware Accelerators - GPU, FPGA]
    
    subgraph "Performance Features"
        M[Enhanced Networking]
        N[SR-IOV]
        O[Placement Groups]
        P[Instance Store]
    end
    
    M --> C
    M --> D
    M --> E
    N --> F
    N --> G
    O --> D
    O --> E
    P --> F
```

### Placement Groups

```mermaid
graph LR
    A[Placement Groups] --> B[Cluster]
    A --> C[Partition]
    A --> D[Spread]
    
    B --> E[Low Latency, High Throughput]
    C --> F[Large Distributed Workloads]
    D --> G[Critical Instance Isolation]
    
    subgraph "Cluster Group"
        H[Same AZ]
        I[10 Gbps Network]
        J[Low Latency]
    end
    
    subgraph "Partition Group"
        K[Multiple AZs]
        L[Hardware Isolation]
        M[Up to 7 Partitions per AZ]
    end
    
    subgraph "Spread Group"
        N[Multiple AZs]
        O[Distinct Hardware]
        P[Max 7 Instances per AZ]
    end
    
    E --> H
    E --> I
    E --> J
    
    F --> K
    F --> L
    F --> M
    
    G --> N
    G --> O
    G --> P
```

### Container Performance Optimization

```mermaid
graph TD
    A[Container Workload] --> B{Orchestration Platform}
    
    B --> C[ECS]
    B --> D[EKS]
    B --> E[AWS Fargate]
    
    C --> F[EC2 Launch Type]
    C --> G[Fargate Launch Type]
    
    D --> H[Managed Node Groups]
    D --> I[Self-Managed Nodes]
    D --> J[Fargate Profile]
    
    subgraph "Performance Optimization"
        K[CPU and Memory Sizing]
        L[Network Mode]
        M[Storage Optimization]
        N[Auto Scaling]
    end
    
    K --> C
    K --> D
    L --> F
    M --> F
    M --> H
    N --> C
    N --> D
    
    subgraph "ECS Optimization"
        O[Task Placement]
        P[Service Discovery]
        Q[Load Balancing]
    end
    
    subgraph "EKS Optimization"
        R[Pod Scheduling]
        S[Horizontal Pod Autoscaler]
        T[Cluster Autoscaler]
    end
```

### Serverless Performance

```mermaid
graph LR
    A[Lambda Function] --> B[Memory Allocation]
    B --> C[CPU Performance]
    
    D[Cold Start Optimization] --> E[Provisioned Concurrency]
    D --> F[Connection Pooling]
    D --> G[Code Optimization]
    
    H[Concurrent Executions] --> I[Reserved Concurrency]
    H --> J[Provisioned Concurrency]
    
    subgraph "Performance Factors"
        K[Memory: 128MB - 10GB]
        L[Timeout: 1s - 15min]
        M[Environment Variables]
        N[Layers]
    end
    
    B --> K
    A --> L
    G --> M
    G --> N
    
    subgraph "Event Sources"
        O[Synchronous - API Gateway]
        P[Asynchronous - S3, SNS]
        Q[Stream-based - DynamoDB, Kinesis]
    end
    
    O --> A
    P --> A
    Q --> A
```

## Storage Performance Optimization

### EBS Volume Types and Performance

```mermaid
graph TD
    A[EBS Volume Types] --> B[gp3 - General Purpose SSD]
    A --> C[gp2 - General Purpose SSD]
    A --> D[io2/io1 - Provisioned IOPS SSD]
    A --> E[st1 - Throughput Optimized HDD]
    A --> F[sc1 - Cold HDD]
    
    B --> G[3,000 IOPS baseline, up to 16,000]
    C --> H[3 IOPS per GB, burstable]
    D --> I[Up to 64,000 IOPS]
    E --> J[Up to 500 MB/s throughput]
    F --> K[Up to 250 MB/s throughput]
    
    subgraph "Performance Characteristics"
        L[IOPS vs Throughput]
        M[Burst Credits]
        N[Queue Depth]
        O[I/O Size]
    end
    
    L --> B
    L --> D
    M --> C
    N --> D
    O --> E
    O --> F
    
    subgraph "Optimization Techniques"
        P[EBS-Optimized Instances]
        Q[Multi-Attach]
        R[RAID Configuration]
        S[Application-level Optimization]
    end
    
    P --> B
    P --> D
    Q --> D
    R --> B
    R --> D
    S --> G
    S --> I
```

### Instance Store Performance

```mermaid
graph LR
    A[Instance Store] --> B[NVMe SSD]
    B --> C[Very High IOPS]
    B --> D[High Throughput]
    B --> E[Low Latency]
    
    F[Ephemeral Storage] --> G[No Persistence]
    G --> H[Use Cases]
    
    H --> I[Temporary Storage]
    H --> J[Cache]
    H --> K[Scratch Data]
    H --> L[High-Performance Databases]
    
    subgraph "Performance Benefits"
        M[No Network Overhead]
        N[Direct Attached]
        O[Instance Type Dependent]
    end
    
    M --> C
    N --> D
    O --> E
    
    subgraph "Instance Types with Instance Store"
        P[C5d, M5d, R5d]
        Q[I3, I3en]
        R[D2, D3]
        S[H1]
    end
    
    P --> B
    Q --> B
    R --> B
    S --> B
```

### S3 Performance Optimization

```mermaid
graph TD
    A[S3 Performance] --> B[Request Rate]
    A --> C[Transfer Acceleration]
    A --> D[Multipart Upload]
    A --> E[Parallel Downloads]
    
    B --> F[3,500 PUT/COPY/POST/DELETE per prefix]
    B --> G[5,500 GET/HEAD per prefix]
    
    C --> H[CloudFront Edge Locations]
    H --> I[Global Acceleration]
    
    D --> J[Parts uploaded in parallel]
    D --> K[Recommended for files > 100MB]
    D --> L[Required for files > 5GB]
    
    E --> M[Range GET requests]
    E --> N[Concurrent downloads]
    
    subgraph "Optimization Strategies"
        O[Request Patterns]
        P[Prefix Distribution]
        Q[Connection Pooling]
        R[Retry Logic]
    end
    
    O --> B
    P --> F
    P --> G
    Q --> C
    R --> A
    
    subgraph "Monitoring"
        S[CloudWatch Metrics]
        T[S3 Access Logs]
        U[CloudTrail]
    end
    
    S --> A
    T --> A
    U --> A
```

### EFS Performance

```mermaid
graph LR
    A[EFS Performance] --> B[Performance Mode]
    A --> C[Throughput Mode]
    
    B --> D[General Purpose]
    B --> E[Max I/O]
    
    C --> F[Bursting]
    C --> G[Provisioned]
    
    D --> H[Lower latency, up to 7,000 ops/sec]
    E --> I[Higher latency, >7,000 ops/sec]
    
    F --> J[Baseline + burst credits]
    G --> K[Fixed throughput]
    
    subgraph "Optimization Factors"
        L[Number of clients]
        M[I/O patterns]
        N[File sizes]
        O[Concurrent access]
    end
    
    L --> A
    M --> A
    N --> A
    O --> A
    
    subgraph "Use Cases"
        P[General Purpose - Web servers]
        Q[Max I/O - Big data analytics]
        R[Provisioned - Consistent workloads]
    end
    
    D --> P
    E --> Q
    G --> R
```

## Database Performance

### RDS Performance Optimization

```mermaid
graph TD
    A[RDS Performance] --> B[Instance Class]
    A --> C[Storage Type]
    A --> D[Read Replicas]
    A --> E[Parameter Groups]
    
    B --> F[CPU and Memory]
    C --> G[IOPS and Throughput]
    D --> H[Read Scaling]
    E --> I[Database Configuration]
    
    subgraph "Instance Classes"
        J[db.t3/t4g - Burstable]
        K[db.m5/m6i - General Purpose]
        L[db.r5/r6g - Memory Optimized]
        M[db.x1e - High Memory]
    end
    
    F --> J
    F --> K
    F --> L
    F --> M
    
    subgraph "Storage Types"
        N[gp2 - General Purpose]
        O[gp3 - General Purpose]
        P[io1/io2 - Provisioned IOPS]
    end
    
    G --> N
    G --> O
    G --> P
    
    subgraph "Performance Features"
        Q[Performance Insights]
        R[Enhanced Monitoring]
        S[CloudWatch Metrics]
        T[Automated Backups]
    end
    
    Q --> A
    R --> A
    S --> A
    T --> C
```

### DynamoDB Performance

```mermaid
graph LR
    A[DynamoDB Performance] --> B[Capacity Modes]
    A --> C[Hot Partitions]
    A --> D[GSI/LSI]
    A --> E[Connection Pooling]
    
    B --> F[On-Demand]
    B --> G[Provisioned]
    
    F --> H[Auto-scaling]
    G --> I[RCU/WCU Management]
    
    C --> J[Partition Key Design]
    J --> K[Even Distribution]
    
    D --> L[Query Optimization]
    L --> M[Projection Types]
    
    subgraph "Performance Patterns"
        N[Batch Operations]
        O[Parallel Queries]
        P[Connection Reuse]
        Q[Exponential Backoff]
    end
    
    N --> A
    O --> A
    P --> E
    Q --> A
    
    subgraph "Monitoring"
        R[CloudWatch Metrics]
        S[X-Ray Tracing]
        T[Contributor Insights]
    end
    
    R --> A
    S --> A
    T --> C
```

### Aurora Performance

```mermaid
graph TD
    A[Aurora Performance] --> B[Multi-AZ Cluster]
    A --> C[Aurora Replicas]
    A --> D[Aurora Serverless]
    A --> E[Global Database]
    
    B --> F[Writer Instance]
    B --> G[Reader Instances]
    
    C --> H[Up to 15 replicas]
    C --> I[Auto-scaling]
    
    D --> J[On-demand scaling]
    D --> K[Pay per use]
    
    E --> L[Cross-region replication]
    E --> M[< 1 second lag]
    
    subgraph "Performance Features"
        N[Storage Auto-scaling]
        O[Backtrack]
        P[Performance Insights]
        Q[Query Cache]
    end
    
    N --> A
    O --> A
    P --> A
    Q --> G
    
    subgraph "Connection Management"
        R[RDS Proxy]
        S[Connection Pooling]
        T[Lambda Integration]
    end
    
    R --> A
    S --> R
    T --> R
```

## Network Performance

### Enhanced Networking

```mermaid
graph LR
    A[Enhanced Networking] --> B[SR-IOV]
    A --> C[Elastic Network Adapter]
    A --> D[Intel 82599 VF]
    
    B --> E[Hardware Virtualization]
    C --> F[Up to 100 Gbps]
    D --> G[Up to 10 Gbps]
    
    subgraph "Performance Benefits"
        H[Higher Bandwidth]
        I[Lower Latency]
        J[Lower Jitter]
        K[Higher PPS]
    end
    
    F --> H
    F --> I
    G --> I
    E --> J
    F --> K
    
    subgraph "Instance Types"
        L[Current Generation]
        M[C5, M5, R5, etc.]
        N[Previous Generation]
        O[C4, M4, R4, etc.]
    end
    
    C --> L
    C --> M
    D --> N
    D --> O
    
    subgraph "Network Optimization"
        P[Placement Groups]
        Q[Multiple ENIs]
        R[Jumbo Frames]
    end
    
    P --> A
    Q --> A
    R --> A
```

### Load Balancer Performance

```mermaid
graph TD
    A[Load Balancer Performance] --> B[Application Load Balancer]
    A --> C[Network Load Balancer]
    A --> D[Gateway Load Balancer]
    
    B --> E[Layer 7 Processing]
    B --> F[Content-based Routing]
    B --> G[WebSocket Support]
    
    C --> H[Layer 4 Processing]
    C --> I[Ultra-low Latency]
    C --> J[Static IP Support]
    
    D --> K[Layer 3 Processing]
    D --> L[Third-party Appliances]
    
    subgraph "Performance Features"
        M[Cross-zone Load Balancing]
        N[Connection Draining]
        O[Health Checks]
        P[Sticky Sessions]
    end
    
    M --> B
    M --> C
    N --> B
    O --> B
    O --> C
    P --> B
    
    subgraph "Optimization"
        Q[Target Group Configuration]
        R[Health Check Tuning]
        S[Connection Settings]
    end
    
    Q --> A
    R --> O
    S --> B
    S --> C
```

### VPC Performance

```mermaid
graph LR
    A[VPC Performance] --> B[VPC Endpoints]
    A --> C[NAT Gateway]
    A --> D[Internet Gateway]
    A --> E[Transit Gateway]
    
    B --> F[S3/DynamoDB Gateway]
    B --> G[Interface Endpoints]
    
    C --> H[Managed NAT Service]
    C --> I[High Availability]
    
    D --> J[Internet Access]
    D --> K[Highly Available]
    
    E --> L[Inter-VPC Connectivity]
    E --> M[Central Hub]
    
    subgraph "Performance Benefits"
        N[Reduced Latency]
        O[No Internet Routing]
        P[Cost Optimization]
        Q[Bandwidth Optimization]
    end
    
    F --> N
    F --> O
    G --> N
    H --> P
    L --> Q
    
    subgraph "Network ACLs vs Security Groups"
        R[Subnet Level - Stateless]
        S[Instance Level - Stateful]
    end
    
    R --> A
    S --> A
```

## Caching Strategies

### ElastiCache Performance

```mermaid
graph TD
    A[ElastiCache] --> B[Redis]
    A --> C[Memcached]
    
    B --> D[Data Structures]
    B --> E[Persistence]
    B --> F[Replication]
    B --> G[Cluster Mode]
    
    C --> H[Simple Key-Value]
    C --> I[Multi-threading]
    C --> J[Horizontal Scaling]
    
    subgraph "Redis Features"
        K[Sorted Sets]
        L[Lists]
        M[Hashes]
        N[Pub/Sub]
    end
    
    D --> K
    D --> L
    D --> M
    D --> N
    
    subgraph "Performance Optimization"
        O[Node Types]
        P[Parameter Groups]
        Q[Connection Pooling]
        R[Pipeline]
    end
    
    O --> A
    P --> A
    Q --> A
    R --> B
    
    subgraph "Scaling Strategies"
        S[Vertical Scaling]
        T[Horizontal Scaling]
        U[Read Replicas]
    end
    
    S --> B
    T --> C
    T --> G
    U --> B
```

### Application-Level Caching

```mermaid
graph LR
    A[Application Caching] --> B[In-Memory Cache]
    A --> C[Database Query Cache]
    A --> D[Session Cache]
    A --> E[Object Cache]
    
    F[Cache Patterns] --> G[Cache-Aside]
    F --> H[Write-Through]
    F --> I[Write-Behind]
    F --> J[Refresh-Ahead]
    
    G --> K[Application Manages Cache]
    H --> L[Write to Cache and DB]
    I --> M[Write to Cache, Async to DB]
    J --> N[Proactive Cache Refresh]
    
    subgraph "Cache Levels"
        O[Browser Cache]
        P[CDN Cache]
        Q[Application Cache]
        R[Database Cache]
    end
    
    O --> A
    P --> A
    Q --> B
    R --> C
    
    subgraph "Performance Considerations"
        S[Cache Hit Ratio]
        T[TTL Settings]
        U[Cache Invalidation]
        V[Cache Warming]
    end
    
    S --> A
    T --> A
    U --> A
    V --> A
```

### CDN and Edge Caching

```mermaid
graph TD
    A[CloudFront CDN] --> B[Edge Locations]
    A --> C[Regional Edge Caches]
    A --> D[Origin Servers]
    
    B --> E[Global Distribution]
    C --> F[Larger Cache]
    D --> G[S3, ALB, Custom]
    
    subgraph "Caching Behaviors"
        H[TTL Settings]
        I[Cache Key]
        J[Query String Parameters]
        K[Headers]
    end
    
    H --> A
    I --> A
    J --> A
    K --> A
    
    subgraph "Performance Features"
        L[HTTP/2 Support]
        M[Gzip Compression]
        N[Origin Shield]
        O[Lambda@Edge]
    end
    
    L --> A
    M --> A
    N --> C
    O --> B
    
    subgraph "Optimization"
        P[Cache Hit Ratio]
        Q[Origin Offload]
        R[Transfer Acceleration]
    end
    
    P --> A
    Q --> A
    R --> A
```

## Content Delivery and Edge Services

### CloudFront Performance Optimization

```mermaid
graph LR
    A[CloudFront Optimization] --> B[Distribution Settings]
    A --> C[Cache Behaviors]
    A --> D[Origin Configuration]
    A --> E[Edge Functions]
    
    B --> F[Price Class]
    B --> G[Compression]
    B --> H[HTTP Versions]
    
    C --> I[Path Patterns]
    C --> J[TTL Values]
    C --> K[Query Strings]
    
    D --> L[Origin Timeout]
    D --> M[Keep-alive Timeout]
    D --> N[Origin Shield]
    
    E --> O[Lambda@Edge]
    E --> P[CloudFront Functions]
    
    subgraph "Performance Features"
        Q[Real-time Logs]
        R[Monitoring]
        S[Cache Statistics]
    end
    
    Q --> A
    R --> A
    S --> A
    
    subgraph "Use Cases"
        T[Static Content]
        U[Dynamic Content]
        V[API Acceleration]
        W[Live Streaming]
    end
    
    T --> A
    U --> A
    V --> A
    W --> A
```

### Global Accelerator

```mermaid
graph TD
    A[Global Accelerator] --> B[Anycast IP Addresses]
    A --> C[AWS Global Network]
    A --> D[Endpoint Groups]
    
    B --> E[Static IP Addresses]
    E --> F[DNS Complexity Reduction]
    
    C --> G[AWS Backbone]
    G --> H[Performance Optimization]
    
    D --> I[Regional Endpoints]
    I --> J[Health Checks]
    I --> K[Traffic Dials]
    
    subgraph "Performance Benefits"
        L[Reduced Latency]
        M[Improved Performance]
        N[Fault Tolerance]
        O[DDoS Protection]
    end
    
    H --> L
    G --> M
    J --> N
    A --> O
    
    subgraph "Endpoint Types"
        P[Application Load Balancer]
        Q[Network Load Balancer]
        R[EC2 Instances]
        S[Elastic IP Addresses]
    end
    
    I --> P
    I --> Q
    I --> R
    I --> S
    
    subgraph "Traffic Management"
        T[Health-based Routing]
        U[Geographic Routing]
        V[Traffic Percentage]
    end
    
    T --> D
    U --> D
    V --> K
```

## Practice Questions

### Question 1
A web application experiences high CPU utilization during peak hours. The application is CPU-intensive and requires consistent high performance. What instance type should you choose?

A) T3.large with unlimited mode
B) M5.large for balanced performance
C) C5.large for compute optimization
D) R5.large for memory optimization

**Answer: C**
**Explanation**: C5 instances are compute-optimized with high-performance processors, ideal for CPU-intensive applications requiring consistent high performance. T3 instances are burstable and not suitable for sustained high CPU usage.

### Question 2
Your application needs to achieve 20,000 IOPS consistently. What EBS volume type should you choose?

A) gp3 with baseline IOPS
B) gp2 with burst credits
C) io2 with provisioned IOPS
D) st1 for throughput optimization

**Answer: C**
**Explanation**: io2 volumes provide consistent provisioned IOPS up to 64,000 IOPS, making them ideal for applications requiring specific IOPS performance. gp3 baseline is 3,000 IOPS, and gp2 depends on volume size and burst credits.

### Question 3
A database application requires the lowest possible latency for storage access. What storage solution should you implement?

A) EBS gp3 volumes
B) EBS io2 volumes
C) Instance store (NVMe SSD)
D) EFS with Max I/O mode

**Answer: C**
**Explanation**: Instance store provides the lowest latency as it's directly attached to the instance without network overhead. However, data is ephemeral and lost when the instance stops.

### Question 4
Your application serves global users and needs to minimize latency for API calls. What combination provides the best performance?

A) Single region deployment with larger instances
B) CloudFront with API Gateway caching
C) Global Accelerator with ALB endpoints in multiple regions
D) Route 53 latency-based routing only

**Answer: C**
**Explanation**: Global Accelerator routes traffic over AWS's global network to the nearest healthy endpoint, providing optimal performance for dynamic content and API calls. CloudFront is better for static content caching.

### Question 5
A DynamoDB table experiences hot partition issues. What is the most effective solution?

A) Increase the table's provisioned capacity
B) Use a composite partition key with better distribution
C) Switch to on-demand billing mode
D) Add more global secondary indexes

**Answer: B**
**Explanation**: Hot partitions occur when the partition key doesn't distribute data evenly. Using a composite partition key or adding a random suffix helps distribute data across multiple partitions, resolving hot partition issues.

### Question 6
Your Lambda function experiences cold starts affecting performance. What optimization strategy should you implement?

A) Increase memory allocation
B) Use provisioned concurrency
C) Implement connection pooling
D) All of the above

**Answer: D**
**Explanation**: All options help optimize Lambda performance: higher memory allocation provides more CPU, provisioned concurrency eliminates cold starts, and connection pooling reduces initialization overhead.

### Question 7
An application needs to cache session data with high availability and data structure support. What caching solution should you use?

A) ElastiCache for Memcached
B) ElastiCache for Redis with replication
C) DynamoDB as a cache
D) S3 with short TTL

**Answer: B**
**Explanation**: ElastiCache for Redis supports complex data structures, provides high availability through replication, and is ideal for session storage. Memcached doesn't support replication or data structures.

### Question 8
A read-heavy database workload needs to scale read capacity without impacting write performance. What solution should you implement?

A) Upgrade to a larger RDS instance
B) Implement RDS read replicas
C) Use DynamoDB Auto Scaling
D) Enable RDS Multi-AZ

**Answer: B**
**Explanation**: RDS read replicas provide additional read capacity by offloading read traffic from the primary database. They can be created in multiple AZs or regions for better distribution.

### Question 9
Your application uploads large files (>5GB) to S3 and needs optimal upload performance. What upload strategy should you use?

A) Single-part upload with S3 Transfer Acceleration
B) Multipart upload with parallel parts
C) Multiple single-part uploads
D) S3 Batch Operations

**Answer: B**
**Explanation**: Multipart upload is required for files >5GB and allows parallel upload of parts, significantly improving performance. Transfer Acceleration can be combined with multipart uploads for further optimization.

### Question 10
A web application behind CloudFront has a low cache hit ratio. What optimization should you implement?

A) Increase TTL values for all content
B) Configure cache behaviors based on content type
C) Use origin shield
D) Enable compression

**Answer: B**
**Explanation**: Configuring different cache behaviors for different content types (static vs dynamic) with appropriate TTL values improves cache hit ratio. Static content can have longer TTLs while dynamic content has shorter TTLs.

## Official Documentation

### Compute Performance
- [Amazon EC2 Instance Types](https://aws.amazon.com/ec2/instance-types/)
- [Amazon EC2 User Guide for Linux Instances](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/)
- [AWS Lambda Developer Guide](https://docs.aws.amazon.com/lambda/latest/dg/)
- [Amazon ECS Developer Guide](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/)

### Storage Performance
- [Amazon EBS User Guide](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/AmazonEBS.html)
- [Amazon S3 Performance Guidelines](https://docs.aws.amazon.com/AmazonS3/latest/userguide/optimizing-performance.html)
- [Amazon EFS User Guide](https://docs.aws.amazon.com/efs/latest/ug/)

### Database Performance
- [Amazon RDS User Guide](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/)
- [Amazon DynamoDB Developer Guide](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/)
- [Amazon Aurora User Guide](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/)

### Network Performance
- [Amazon VPC User Guide](https://docs.aws.amazon.com/vpc/latest/userguide/)
- [Elastic Load Balancing User Guide](https://docs.aws.amazon.com/elasticloadbalancing/)
- [AWS Global Accelerator Developer Guide](https://docs.aws.amazon.com/global-accelerator/latest/dg/)

### Caching and Content Delivery
- [Amazon ElastiCache User Guide](https://docs.aws.amazon.com/AmazonElastiCache/latest/mem-ug/)
- [Amazon CloudFront Developer Guide](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/)
- [AWS Caching Best Practices](https://aws.amazon.com/caching/)

### Performance Monitoring
- [Amazon CloudWatch User Guide](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/)
- [AWS X-Ray Developer Guide](https://docs.aws.amazon.com/xray/latest/devguide/)
- [Amazon RDS Performance Insights](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_PerfInsights.html)
