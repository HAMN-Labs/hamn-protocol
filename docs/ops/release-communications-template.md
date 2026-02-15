# Release Communications Template (Internal / Public)

Статус: active
Дата: 2026-02-16
Task: HAMN-043

## Purpose

Унифицировать коммуникации во время rollout:
- pre-release announcement
- in-progress status updates
- incident updates
- completion summary

## Internal Template

### 1) Pre-Release Announcement (Internal)

```text
[Release Notice] <release-tag> / <environment>
Start Window (UTC): <time>
Scope: <summary>
Owners: Protocol=<name>, Security=<name>, Ops=<name>
Risk Level: <low/medium/high>
Rollback Plan: <short-link>
Runbooks:
- <link1>
- <link2>
```

### 2) Rollout Progress Update (Internal)

```text
[Rollout Update] <release-tag>
Time (UTC): <time>
Current Stage: <C0/C1/C2/C3>
Gate Metrics: <ok/warn>
Issues: <none|summary>
Next Checkpoint: <time>
```

### 3) Incident Update (Internal)

```text
[Incident Update] <incident-id>
Time (UTC): <time>
Severity: <Sev-1/2/3>
Impact: <summary>
Action Taken: <summary>
Current Status: <mitigating|monitoring|resolved>
Next Update ETA: <time>
```

### 4) Post-Release Summary (Internal)

```text
[Release Summary] <release-tag>
Decision: GO / NO-GO / ROLLBACK
Result: <summary>
Key Metrics: <summary>
Incidents: <none|list>
Follow-ups: <list>
```

## Public Template

### 1) Maintenance / Upgrade Notice

```text
We are performing a planned protocol upgrade.
Window (UTC): <start-end>
Expected Impact: <none/minor interruptions>
Status updates will be posted here.
```

### 2) Live Status Update

```text
Update <time UTC>:
The upgrade is <in progress / completed>.
Current status: <summary>
Next update: <time or "as needed">.
```

### 3) Incident Notice

```text
We are investigating an issue affecting <component/scope>.
Current impact: <summary>
Our team is actively mitigating.
Next update: <time UTC>.
```

### 4) Resolution Notice

```text
The issue has been resolved.
Resolution time (UTC): <time>
Impact summary: <summary>
We will publish a post-incident summary if needed.
```

## Usage Notes

- Всегда использовать UTC timestamps.
- Не публиковать чувствительные security details до внутреннего согласования.
- Public updates должны быть краткими и без неподтвержденных утверждений.
- Internal updates должны ссылаться на runbooks/ledger/checklists.
