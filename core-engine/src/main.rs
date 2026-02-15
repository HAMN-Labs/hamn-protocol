use axum::{
    extract::{Path, State},
    http::StatusCode,
    routing::{get, post},
    Json, Router,
};
use core_engine::{MemoryNode, Pattern, QueryResult};
use serde::Deserialize;
use std::sync::{Arc, RwLock};
use tower_http::cors::CorsLayer;
use tower_http::trace::TraceLayer;

// Define the state shared across requests
struct AppState {
    node: Arc<RwLock<MemoryNode>>,
}

#[tokio::main]
async fn main() {
    // Initialize tracing
    tracing_subscriber::fmt()
        .with_env_filter("core_engine=debug,tower_http=debug")
        .init();

    // Initialize state
    let state = Arc::new(AppState {
        node: Arc::new(RwLock::new(MemoryNode::new())),
    });

    // Build router
    let app = Router::new()
        .route("/health", get(health_check))
        .route("/query", post(query))
        .route("/patterns", post(add_pattern))
        .route("/patterns/:id", get(get_pattern).delete(remove_pattern))
        .route("/patterns/:id/usage", post(record_usage))
        .route("/decay", post(decay))
        .layer(CorsLayer::permissive())
        .layer(TraceLayer::new_for_http())
        .with_state(state);

    // Run server
    let listener = tokio::net::TcpListener::bind("0.0.0.0:8080").await.unwrap();
    tracing::info!("listening on {}", listener.local_addr().unwrap());
    axum::serve(listener, app).await.unwrap();
}

// ─── Handlers ────────────────────────────────────────────────────────

async fn health_check() -> (StatusCode, Json<serde_json::Value>) {
    (StatusCode::OK, Json(serde_json::json!({ "status": "ok" })))
}

#[derive(Deserialize)]
struct QueryRequest {
    vector: Vec<f32>,
    #[serde(default = "default_k")]
    k: usize,
}

fn default_k() -> usize {
    1
}

async fn query(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<QueryRequest>,
) -> Json<Vec<QueryResult>> {
    let node = state.node.read().unwrap();
    let results = node.find_top_k(&payload.vector, payload.k);
    Json(results)
}

async fn add_pattern(
    State(state): State<Arc<AppState>>,
    Json(pattern): Json<Pattern>,
) -> (StatusCode, Json<Pattern>) {
    let mut node = state.node.write().unwrap();
    node.add_pattern(pattern.clone());
    (StatusCode::CREATED, Json(pattern))
}

async fn get_pattern(
    State(state): State<Arc<AppState>>,
    Path(id): Path<String>,
) -> Result<Json<Pattern>, StatusCode> {
    let node = state.node.read().unwrap();
    match node.get_pattern(&id) {
        Some(p) => Ok(Json(p.clone())),
        None => Err(StatusCode::NOT_FOUND),
    }
}

async fn remove_pattern(
    State(state): State<Arc<AppState>>,
    Path(id): Path<String>,
) -> Result<Json<Pattern>, StatusCode> {
    let mut node = state.node.write().unwrap();
    match node.remove_pattern(&id) {
        Some(p) => Ok(Json(p)),
        None => Err(StatusCode::NOT_FOUND),
    }
}

#[derive(Deserialize)]
struct UsageRequest {
    reward: f32,
}

async fn record_usage(
    State(state): State<Arc<AppState>>,
    Path(id): Path<String>,
    Json(payload): Json<UsageRequest>,
) -> Result<Json<Pattern>, StatusCode> {
    let mut node = state.node.write().unwrap();
    match node.record_usage(&id, payload.reward) {
        Some(p) => Ok(Json(p.clone())),
        None => Err(StatusCode::NOT_FOUND),
    }
}

async fn decay(State(state): State<Arc<AppState>>) -> StatusCode {
    let mut node = state.node.write().unwrap();
    node.decay_all();
    StatusCode::NO_CONTENT
}
