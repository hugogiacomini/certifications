# Domain 2: Design Resilient Architectures (26% of exam)

## Table of Contents
1. [Introduction](#introduction)
2. [Fault-Tolerant and Resilient Architectures](#fault-tolerant-and-resilient-architectures)
3. [High Availability and Disaster Recovery](#high-availability-and-disaster-recovery)
4. [Auto Scaling and Load Balancing](#auto-scaling-and-load-balancing)
5. [Decoupling Components](#decoupling-components)
6. [Reliable Storage Solutions](#reliable-storage-solutions)
7. [Practice Questions](#practice-questions)
8. [Official Documentation](#official-documentation)

## Introduction

This domain focuses on designing resilient architectures that can withstand failures and continue operating. You'll learn about high availability, disaster recovery, auto scaling, decoupling, and reliable storage solutions.

## Fault-Tolerant and Resilient Architectures

### Multi-AZ Deployments

```mermaid
graph TD
    A[Route 53] --> B[Application Load Balancer]
    
    B --> C[AZ-1a]
    B --> D[AZ-1b]
    B --> E[AZ-1c]
    
    C --> F[EC2 Instances]
    D --> G[EC2 Instances]
    E --> H[EC2 Instances]
    
    F --> I[RDS Primary]
    G --> I
    H --> J[RDS Standby]
    
    subgraph "Availability Zone 1a"
        C
        F
        I
    end
    
    subgraph "Availability Zone 1b"
        D
        G
    end
    
    subgraph "Availability Zone 1c"
        E
        H
        J
    end
    
    K[Auto Scaling Group] --> F
    K --> G
    K --> H
```

#### Key Principles:
- **Distribute across AZs**: Spread resources across multiple availability zones
- **Eliminate single points of failure**: Design redundancy at every layer
- **Automatic failover**: Implement automated recovery mechanisms
- **Health checks**: Monitor component health for rapid failure detection

### Circuit Breaker Pattern

```mermaid
graph LR
    A[Client] --> B{Circuit Breaker}
    B --> C[Closed State]
    B --> D[Open State]
    B --> E[Half-Open State]
    
    C --> F[Service Call]
    F --> G{Success?}
    G -->|Yes| H[Return Response]
    G -->|No| I[Increment Failure Count]
    I --> J{Threshold Reached?}
    J -->|Yes| D
    J -->|No| C
    
    D --> K[Return Cached/Default Response]
    
    E --> L[Limited Service Calls]
    L --> M{Success?}
    M -->|Yes| C
    M -->|No| D
```

### Bulkhead Pattern

```mermaid
graph TD
    A[Application] --> B[Resource Pool 1]
    A --> C[Resource Pool 2]
    A --> D[Resource Pool 3]
    
    B --> E[Critical Service]
    C --> F[Non-Critical Service]
    D --> G[Batch Processing]
    
    subgraph "Isolation"
        H[Separate Compute]
        I[Separate Memory]
        J[Separate Network]
    end
    
    H --> B
    H --> C
    H --> D
    I --> B
    I --> C
    I --> D
    J --> B
    J --> C
    J --> D
```

## High Availability and Disaster Recovery

### RTO and RPO Requirements

```mermaid
graph LR
    A[Disaster Occurs] --> B[Downtime Period]
    B --> C[Recovery Complete]
    
    D[Last Backup] --> E[Data Loss Period]
    E --> A
    
    F[RTO - Recovery Time Objective] --> B
    G[RPO - Recovery Point Objective] --> E
    
    subgraph "DR Strategies"
        H[Backup & Restore]
        I[Pilot Light]
        J[Warm Standby]
        K[Hot Standby/Multi-Site]
    end
    
    H --> L[High RTO, High RPO]
    I --> M[Medium RTO, Low RPO]
    J --> N[Low RTO, Low RPO]
    K --> O[Very Low RTO, Very Low RPO]
```

### Disaster Recovery Strategies

```mermaid
graph TD
    A[Production Site] --> B{Disaster Event}
    
    B --> C[Backup & Restore]
    B --> D[Pilot Light]
    B --> E[Warm Standby]
    B --> F[Hot Standby]
    
    C --> G[Restore from S3/Glacier]
    D --> H[Scale up minimal infrastructure]
    E --> I[Scale up partially running systems]
    F --> J[Immediate failover to running systems]
    
    subgraph "Recovery Site"
        K[Minimal Infrastructure]
        L[Core Systems Running]
        M[Full Infrastructure Running]
    end
    
    H --> K
    I --> L
    J --> M
    
    subgraph "Cost vs Speed"
        N[Low Cost, Slow Recovery]
        O[Medium Cost, Medium Recovery]
        P[High Cost, Fast Recovery]
    end
    
    C --> N
    D --> O
    E --> O
    F --> P
```

### Cross-Region Replication

```mermaid
graph LR
    A[Primary Region - us-east-1] --> B[Secondary Region - us-west-2]
    
    subgraph "Primary Region"
        C[RDS Primary]
        D[S3 Bucket]
        E[DynamoDB Table]
        F[EBS Snapshots]
    end
    
    subgraph "Secondary Region"
        G[RDS Read Replica]
        H[S3 Cross-Region Replication]
        I[DynamoDB Global Tables]
        J[EBS Snapshot Copy]
    end
    
    C --> G
    D --> H
    E --> I
    F --> J
    
    K[Route 53 Health Checks] --> L[DNS Failover]
    L --> A
    L --> B
```

## Auto Scaling and Load Balancing

### Auto Scaling Architecture

```mermaid
graph TD
    A[CloudWatch Metrics] --> B[Auto Scaling Policy]
    B --> C[Auto Scaling Group]
    
    C --> D[Launch Template]
    D --> E[EC2 Instances]
    
    F[Application Load Balancer] --> E
    G[Target Group] --> E
    
    H[Health Checks] --> C
    I[Scaling Policies] --> C
    
    subgraph "Scaling Types"
        J[Target Tracking]
        K[Step Scaling]
        L[Simple Scaling]
        M[Scheduled Scaling]
    end
    
    J --> B
    K --> B
    L --> B
    M --> B
    
    subgraph "Metrics"
        N[CPU Utilization]
        O[Memory Usage]
        P[Request Count]
        Q[Custom Metrics]
    end
    
    N --> A
    O --> A
    P --> A
    Q --> A
```

### Load Balancer Types

```mermaid
graph TD
    A[Internet Traffic] --> B{Load Balancer Type}
    
    B --> C[Application Load Balancer]
    B --> D[Network Load Balancer]
    B --> E[Gateway Load Balancer]
    B --> F[Classic Load Balancer]
    
    C --> G[Layer 7 - HTTP/HTTPS]
    D --> H[Layer 4 - TCP/UDP]
    E --> I[Layer 3 - IP]
    F --> J[Layer 4 & 7 - Legacy]
    
    subgraph "ALB Features"
        K[Path-based Routing]
        L[Host-based Routing]
        M[WebSocket Support]
        N[HTTP/2 Support]
    end
    
    subgraph "NLB Features"
        O[Ultra-low Latency]
        P[Static IP]
        Q[Preserve Source IP]
        R[High Throughput]
    end
    
    G --> K
    G --> L
    G --> M
    G --> N
    
    H --> O
    H --> P
    H --> Q
    H --> R
```

### Multi-Region Load Balancing

```mermaid
graph TD
    A[Route 53] --> B{Routing Policy}
    
    B --> C[Failover Routing]
    B --> D[Geolocation Routing]
    B --> E[Latency-based Routing]
    B --> F[Weighted Routing]
    
    G[Primary Region] --> H[Health Check]
    I[Secondary Region] --> J[Health Check]
    
    C --> G
    C --> I
    D --> G
    D --> I
    E --> G
    E --> I
    F --> G
    F --> I
    
    H --> K[Route 53 Health Checks]
    J --> K
    
    subgraph "Health Check Types"
        L[HTTP/HTTPS]
        M[TCP]
        N[Calculated Health Check]
        O[CloudWatch Alarm]
    end
    
    K --> L
    K --> M
    K --> N
    K --> O
```

## Decoupling Components

### Message Queuing with SQS

```mermaid
graph LR
    A[Producer] --> B[SQS Queue]
    B --> C[Consumer]
    
    D[Standard Queue] --> E[At-least-once Delivery]
    F[FIFO Queue] --> G[Exactly-once Processing]
    
    subgraph "SQS Features"
        H[Dead Letter Queue]
        I[Visibility Timeout]
        J[Long Polling]
        K[Message Retention]
    end
    
    B --> H
    B --> I
    B --> J
    B --> K
    
    subgraph "Error Handling"
        L[Retry Logic]
        M[Exponential Backoff]
        N[Circuit Breaker]
    end
    
    C --> L
    L --> M
    M --> N
```

### Event-Driven Architecture with SNS

```mermaid
graph TD
    A[Event Source] --> B[SNS Topic]
    
    B --> C[SQS Queue]
    B --> D[Lambda Function]
    B --> E[HTTP/HTTPS Endpoint]
    B --> F[Email]
    B --> G[SMS]
    
    H[Fan-out Pattern] --> B
    
    subgraph "Message Filtering"
        I[Message Attributes]
        J[Filter Policies]
    end
    
    I --> B
    J --> C
    J --> D
    J --> E
    
    subgraph "Reliability Features"
        K[Message Durability]
        L[Delivery Retry]
        M[Dead Letter Queue]
    end
    
    K --> B
    L --> C
    L --> D
    M --> C
    M --> D
```

### Serverless Event Processing

```mermaid
graph LR
    A[Event Sources] --> B[Lambda Function]
    
    C[S3 Events] --> B
    D[DynamoDB Streams] --> B
    E[Kinesis Streams] --> B
    F[SQS Messages] --> B
    G[SNS Notifications] --> B
    H[API Gateway] --> B
    
    B --> I[Downstream Services]
    
    subgraph "Event Processing Patterns"
        J[Synchronous Invocation]
        K[Asynchronous Invocation]
        L[Stream-based Invocation]
    end
    
    H --> J
    G --> K
    F --> K
    E --> L
    D --> L
    
    subgraph "Error Handling"
        M[Retry Configuration]
        N[Dead Letter Queue]
        O[Destinations]
    end
    
    K --> M
    K --> N
    K --> O
```

### Microservices Communication

```mermaid
graph TD
    A[API Gateway] --> B[Service A]
    A --> C[Service B]
    A --> D[Service C]
    
    B --> E[SQS/SNS]
    C --> E
    D --> E
    
    F[Service Discovery] --> G[ECS Service Discovery]
    F --> H[EKS Service Discovery]
    F --> I[Cloud Map]
    
    G --> B
    G --> C
    G --> D
    
    subgraph "Communication Patterns"
        J[Synchronous - REST/GraphQL]
        K[Asynchronous - Events]
        L[Stream Processing]
    end
    
    A --> J
    E --> K
    M[Kinesis] --> L
    
    subgraph "Resilience Patterns"
        N[Circuit Breaker]
        O[Bulkhead]
        P[Timeout]
        Q[Retry with Backoff]
    end
```

## Reliable Storage Solutions

### S3 Storage Classes and Lifecycle

```mermaid
graph LR
    A[S3 Standard] --> B[S3 IA]
    B --> C[S3 One Zone-IA]
    A --> D[S3 Glacier Instant Retrieval]
    D --> E[S3 Glacier Flexible Retrieval]
    E --> F[S3 Glacier Deep Archive]
    
    G[Lifecycle Policies] --> A
    G --> B
    G --> C
    G --> D
    G --> E
    G --> F
    
    subgraph "Access Patterns"
        H[Frequent Access]
        I[Infrequent Access]
        J[Archive]
        K[Long-term Archive]
    end
    
    H --> A
    I --> B
    I --> C
    J --> D
    J --> E
    K --> F
    
    subgraph "Retrieval Times"
        L[Milliseconds]
        M[Minutes]
        N[Hours]
        O[12+ Hours]
    end
    
    A --> L
    B --> L
    D --> L
    E --> M
    E --> N
    F --> O
```

### Multi-Region Storage Replication

```mermaid
graph TD
    A[Primary Region] --> B[S3 Cross-Region Replication]
    B --> C[Secondary Region]
    
    D[RDS] --> E[Read Replicas]
    E --> F[Multiple Regions]
    
    G[DynamoDB] --> H[Global Tables]
    H --> I[Multiple Regions]
    
    J[EFS] --> K[Regional Replication]
    K --> L[Backup Region]
    
    subgraph "Replication Features"
        M[Automatic Failover]
        N[Encryption in Transit]
        O[Point-in-time Recovery]
        P[Cross-Account Replication]
    end
    
    B --> N
    E --> M
    H --> M
    K --> O
    B --> P
```

### Database High Availability

```mermaid
graph TD
    A[RDS Multi-AZ] --> B[Primary DB]
    A --> C[Standby DB]
    
    B --> D[Synchronous Replication]
    D --> C
    
    E[DynamoDB] --> F[Multi-AZ by Default]
    F --> G[Automatic Failover]
    
    H[Aurora] --> I[Multi-AZ Cluster]
    I --> J[Primary Instance]
    I --> K[Read Replicas]
    
    L[ElastiCache] --> M[Multi-AZ with Failover]
    M --> N[Primary Node]
    M --> O[Replica Nodes]
    
    subgraph "Backup Strategies"
        P[Automated Backups]
        Q[Manual Snapshots]
        R[Point-in-time Recovery]
        S[Cross-Region Backups]
    end
    
    B --> P
    E --> Q
    H --> R
    A --> S
```

## Practice Questions

### Question 1
A company needs to ensure their web application can handle sudden traffic spikes without manual intervention. The application runs on EC2 instances behind an Application Load Balancer. What is the most appropriate solution?

A) Increase the instance size to handle peak load
B) Implement Auto Scaling with target tracking scaling policy
C) Use reserved instances for predictable capacity
D) Deploy instances across multiple regions

**Answer: B**
**Explanation**: Auto Scaling with target tracking scaling policy automatically adjusts the number of instances based on metrics like CPU utilization or request count. This provides automatic scaling without manual intervention and is cost-effective as it only scales when needed.

### Question 2
You need to design a disaster recovery strategy for a critical application with an RTO of 1 hour and RPO of 15 minutes. The application uses EC2 instances, RDS, and S3. What DR strategy should you implement?

A) Backup and restore from S3 and RDS snapshots
B) Pilot light with automated scaling scripts
C) Warm standby with minimal resources running
D) Hot standby with full duplicate environment

**Answer: C**
**Explanation**: Warm standby strategy runs minimal resources in the DR region and can be scaled up within 1 hour (RTO). With RDS read replicas and frequent backups, the RPO of 15 minutes can be achieved. This balances cost and recovery time requirements.

### Question 3
A microservices application experiences cascading failures when one service becomes unavailable. How can you improve the resilience of the architecture?

A) Increase the size of all EC2 instances
B) Implement circuit breaker pattern and bulkhead isolation
C) Deploy all services in a single availability zone
D) Use synchronous communication between all services

**Answer: B**
**Explanation**: Circuit breaker pattern prevents calls to failing services, and bulkhead isolation separates resources to prevent failures from spreading. This combination prevents cascading failures and improves overall system resilience.

### Question 4
Your application needs to process messages asynchronously with guaranteed order processing. Duplicate processing must be avoided. What AWS service configuration should you use?

A) SQS Standard Queue with Lambda
B) SQS FIFO Queue with Lambda
C) SNS Topic with multiple subscribers
D) Kinesis Data Streams with Lambda

**Answer: B**
**Explanation**: SQS FIFO Queue provides exactly-once processing and maintains message order. When combined with Lambda, it ensures messages are processed in order without duplicates, meeting the requirements.

### Question 5
A company wants to implement a fan-out messaging pattern where a single message triggers multiple processing workflows. What is the most suitable AWS service combination?

A) SQS with multiple consumers polling the same queue
B) SNS topic with multiple SQS queue subscriptions
C) Lambda function with multiple invocations
D) Kinesis Data Streams with multiple consumers

**Answer: B**
**Explanation**: SNS fan-out pattern allows a single message to be delivered to multiple SQS queues, each feeding different processing workflows. This decouples the message producer from multiple consumers and provides reliable delivery.

### Question 6
Your web application serves global users and needs to minimize latency while providing automatic failover capability. What combination of services should you implement?

A) Single region deployment with larger instances
B) CloudFront with Route 53 latency-based routing to multi-region deployments
C) Multi-AZ deployment in a single region
D) ELB with instances across multiple AZs

**Answer: B**
**Explanation**: CloudFront provides global edge locations for content delivery, while Route 53 latency-based routing directs users to the nearest healthy region. This combination minimizes latency globally and provides automatic failover.

### Question 7
An application uses RDS MySQL and experiences performance issues during read-heavy workloads. The application can tolerate eventual consistency for read operations. What is the most cost-effective solution?

A) Upgrade to a larger RDS instance type
B) Implement RDS read replicas and modify application to use them for reads
C) Switch to DynamoDB for all operations
D) Enable RDS Multi-AZ deployment

**Answer: B**
**Explanation**: RDS read replicas provide additional read capacity at lower cost than scaling up the primary instance. Since the application can tolerate eventual consistency, read replicas are ideal for offloading read traffic from the primary database.

### Question 8
You need to store application logs that are frequently accessed for the first 30 days, occasionally accessed for 90 days, and then archived for 7 years for compliance. What S3 storage strategy should you implement?

A) Store everything in S3 Standard for 7 years
B) Use S3 Intelligent-Tiering for automatic optimization
C) Implement lifecycle policy: Standard → IA → Glacier → Deep Archive
D) Store all logs in S3 Glacier Deep Archive

**Answer: C**
**Explanation**: A lifecycle policy transitioning from S3 Standard (frequent access) to IA (occasional access) to Glacier (archive) to Deep Archive (long-term compliance) optimizes costs based on access patterns while meeting retention requirements.

### Question 9
A batch processing application needs to process large files uploaded to S3. The processing should be triggered automatically and handle failures gracefully. What architecture should you implement?

A) CloudWatch Events → Lambda → Process files directly
B) S3 Event → SQS → Lambda → Process with retry logic and DLQ
C) Manual polling with EC2 instances
D) S3 Event → SNS → Email notification for manual processing

**Answer: B**
**Explanation**: S3 events trigger SQS messages, which are processed by Lambda with built-in retry logic and dead letter queue (DLQ) for failed messages. This provides automatic triggering, retry capabilities, and failure handling.

### Question 10
Your application requires a database that can automatically scale read capacity based on demand and provide single-digit millisecond latency. What AWS service should you use?

A) RDS with read replicas
B) DynamoDB with Auto Scaling
C) ElastiCache for Redis
D) Aurora Serverless

**Answer: B**
**Explanation**: DynamoDB provides single-digit millisecond latency and can automatically scale read capacity using Auto Scaling based on utilization metrics. This meets both the performance and scaling requirements without manual intervention.

## Official Documentation

### High Availability and Disaster Recovery
- [AWS Architecture Center - Disaster Recovery](https://aws.amazon.com/architecture/disaster-recovery/)
- [AWS Well-Architected Reliability Pillar](https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/welcome.html)
- [Building Fault-Tolerant Applications on AWS](https://docs.aws.amazon.com/whitepapers/latest/fault-tolerant-components/welcome.html)

### Auto Scaling and Load Balancing
- [Amazon EC2 Auto Scaling User Guide](https://docs.aws.amazon.com/autoscaling/ec2/userguide/)
- [Elastic Load Balancing User Guide](https://docs.aws.amazon.com/elasticloadbalancing/latest/userguide/)
- [Application Load Balancer User Guide](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/)

### Messaging and Decoupling
- [Amazon SQS Developer Guide](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/)
- [Amazon SNS Developer Guide](https://docs.aws.amazon.com/sns/latest/dg/)
- [AWS Lambda Developer Guide](https://docs.aws.amazon.com/lambda/latest/dg/)

### Storage Solutions
- [Amazon S3 User Guide](https://docs.aws.amazon.com/AmazonS3/latest/userguide/)
- [Amazon RDS User Guide](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/)
- [Amazon DynamoDB Developer Guide](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/)

### DNS and Global Infrastructure
- [Amazon Route 53 Developer Guide](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/)
- [Amazon CloudFront Developer Guide](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/)
- [AWS Global Infrastructure](https://aws.amazon.com/about-aws/global-infrastructure/)

### Monitoring and Health Checks
- [Amazon CloudWatch User Guide](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/)
- [AWS Systems Manager User Guide](https://docs.aws.amazon.com/systems-manager/latest/userguide/)
- [AWS X-Ray Developer Guide](https://docs.aws.amazon.com/xray/latest/devguide/)
