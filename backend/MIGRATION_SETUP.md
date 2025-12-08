# Database Migration Setup

## 初始化 Alembic（首次設置）

如果這是第一次設置 migration，需要執行以下步驟：

```bash
cd backend

# 1. 安裝依賴（如果還沒安裝）
uv sync

# 2. 創建初始 migration
uv run alembic revision --autogenerate -m "Initial migration"

# 3. 執行 migration
uv run alembic upgrade head
```

## 自動 Migration

應用程序啟動時會自動執行 migration。不需要手動運行 migration 命令。

## 手動 Migration 命令（可選）

如果需要手動管理 migrations：

```bash
cd backend

# 查看當前 migration 狀態
uv run alembic current

# 查看 migration 歷史
uv run alembic history

# 創建新的 migration（當模型變更時）
uv run alembic revision --autogenerate -m "描述變更內容"

# 執行 migration
uv run alembic upgrade head

# 回退到上一個版本
uv run alembic downgrade -1

# 回退到特定版本
uv run alembic downgrade <revision_id>
```

## 注意事項

- Migration 文件位於 `backend/alembic/versions/` 目錄
- 所有 migration 文件都應該提交到 git
- 在正式機上，migration 會在應用啟動時自動執行
- 如果 migration 失敗，應用會回退到 `create_all()` 方法（僅用於開發環境）

