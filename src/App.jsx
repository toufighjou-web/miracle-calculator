// Build 20260428-001003
import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid, BarChart, Bar } from "recharts";

// ─── Brand ────────────────────────────────────────────────────
var NAVY  = "#19304A";
var TEAL  = "#00B4CC";
var TEALX = "#E0F6FA";
var TEALM = "#7DD4E0";
var BG    = "#EEF2F7";
var CARD  = "#FFFFFF";
var BDR   = "#CBD5E1";
var TXT   = "#0F172A";
var SUB   = "#475569";
var MUT   = "#94A3B8";
var GRN   = "#16A34A";
var GRNL  = "#DCFCE7";
var RED   = "#DC2626";
var REDL  = "#FEE2E2";
var AMB   = "#D97706";
var AMBL  = "#FEF3C7";
var BLU   = "#2563EB";
var BLUL  = "#EFF6FF";

var LOGO_B64 = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/Pgo8IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiPgo8c3ZnIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHZlcnNpb249IjEuMSIgd2lkdGg9IjMxNzEuNDI4NDY2Nzk2ODc1IiBoZWlnaHQ9IjI4MTguMjk5MzE2NDA2MjUiIHZpZXdCb3g9IjAgMCAzMTcxLjQyODU3MTQyODU3MTYgMjgxOC4yOTkyMDI1OTIzNTIyIj4KCQkJCgkJCTxnIHRyYW5zZm9ybT0ic2NhbGUoOC41NzE0Mjg1NzE0Mjg1NzEpIHRyYW5zbGF0ZSgxMCwgMTApIj4KCQkJCTxkZWZzIGlkPSJTdmdqc0RlZnMxMDAxIi8+PGcgaWQ9IlN2Z2pzRzEwMDciIGZlYXR1cmVLZXk9InN5bWJvbEZlYXR1cmUtMCIgdHJhbnNmb3JtPSJtYXRyaXgoOS4zNTc4NjAxMDA3MzAyMjEsMCwwLDkuMzU3ODYwMTAwNzMwMjIxLDY4LC0wLjAwMDAwNDQ2MjE3NTQxNzI5NDYwOCkiIGZpbGw9IiNmZmYiPjxkZWZzIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIvPjxnIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggY2xhc3M9ImZpbDAiIGQ9Ik04LjU5OTMgNC4zMjQybDAgMTEuNzU5YzAuODMxNiwtMC4wNTEgMS42OTgyLC0wLjA4IDIuNTg5MiwtMC4wODQ0bC0wLjAwNDggLTkuODMzNCAtMS45NzM1IC0xLjA0NzIgLTAuMDAyOCAtMi41MTk5IDMuMDQwNSAtMi41OTgzIDAgMTYuMDA1NGMwLjEzMDEsMC4wMDIzIDAuMjU5NywwLjAwNSAwLjM4ODcsMC4wMDgzbDAgLTQuNzUwNSAxLjk1MDggLTAuOTg4NSAwIC00Ljg2MDkgMi42MTgzIDIuMjE5NyAtMC4wMDM4IDMuMzk2OCAtMS40OTQyIC0wLjg0NDYgLTAuMDQ4MiA2LjAwODFjMC42NjgzLDAuMDY0MiAxLjMwNzEsMC4xNDMxIDEuOTA5NiwwLjIzNTJsMCAtMy44MTA5IDEuMTE0OCAwLjczNDggMCAzLjI2OTZjMi4wNTYsMC40MDI2IDMuNTU1MywwLjk3MjEgNC4xNjMzLDEuNjI2MSAtNS41NjgyLC0xLjcxNzEgLTE3LjI3MywtMS43MTg5IC0yMi44NDcyLDAgMC43Mzk3LC0wLjc5NTcgMi43OTgyLC0xLjQ2NjMgNS41NzQxLC0xLjg2MzJsLTAuMDE1MyAtMTAuMTAxNyAzLjA0MDUgLTEuOTU5NXoiIHN0eWxlPSJmaWxsOiAjMjBhYWJiOyIvPjwvZz48L2c+PGcgaWQ9IlN2Z2pzRzEwMDgiIGZlYXR1cmVLZXk9ImZpQUtqSS0wIiB0cmFuc2Zvcm09Im1hdHJpeCgyLjYyNjgzODY3ODg1Mjc3OCwwLDAsMi42MjY4Mzg2Nzg4NTI3NzgsMjkuNzkzNDU1NzM1MjI3MDM4LDE3NS4xODY0MzM3MDg1NTc4NCkiIGZpbGw9IiNmZmYiPjxwYXRoIGQ9Ik03LjUyIDIwIGwtMy43IC04LjE4IGwwIDguMTggbC0yLjk4IDAgbDAgLTEzLjcgbDMuNzIgMCBsNC4wMiA5LjA2IGw0LjAyIC05LjA2IGwzLjcyIDAgbDAgMTMuNyBsLTMuMDQgMCBsMCAtOC4yMiBsLTMuNzIgOC4yMiBsLTIuMDQgMCB6IE0yNS4zOSAyMCBsLTMuMSAwIGwwIC0xMy43IGwzLjEgMCBsMCAxMy43IHogTTM2LjcyIDkuMTQgbC0yLjI4IDAgbDAgMy42NiBsMi4xOCAwIGMxLjM0IDAgMi4xNiAtMC43NiAyLjE2IC0xLjgyIHMtMC42OCAtMS44NCAtMi4wNiAtMS44NCB6IE0zNC40NCAxNS4zNCBsMCA0LjY2IGwtMy4xIDAgbDAgLTEzLjcgbDUuODQgMCBjMi45MiAwIDQuNzIgMS44OCA0LjcyIDQuNTYgYzAgMi4xNCAtMS40MiAzLjkyIC0zLjc0IDQuMzggbDQuMzYgNC43NiBsLTQuMDQgMCB6IE01NS42MyAxNC45IGwtMS43OCAtNS4zNiBsLTEuNzggNS4zNiBsMy41NiAwIHogTTU3LjMzMDAwMDAwMDAwMDAwNSAyMCBsLTAuNzggLTIuMzYgbC01LjM4IDAgbC0wLjc4IDIuMzYgbC0zLjE4IDAgbDQuODQgLTEzLjcgbDMuOCAwIGw0LjgyIDEzLjcgbC0zLjM0IDAgeiBNNzIuODQwMDAwMDAwMDAwMDIgOC45IGMtMi4zMiAwIC00LjA4IDEuODYgLTQuMDggNC4yMiBjMCAyLjQyIDEuNzYgNC4yNiA0LjE4IDQuMjYgYzEuNjggMCAyLjk2IC0wLjg4IDMuNzQgLTIuMjIgbDIuNDIgMS42OCBjLTEuMzIgMi4xNiAtMy4zNCAzLjQ0IC02LjEyIDMuNDQgYy00LjIyIDAgLTcuMzggLTMuMTQgLTcuMzggLTcuMTYgYzAgLTMuOTggMy4xNCAtNy4xIDcuMyAtNy4xIGMyLjcgMCA0Ljg0IDEuMTIgNi4xNCAzLjQyIGwtMi40NiAxLjcgYy0wLjggLTEuMzIgLTIgLTIuMjQgLTMuNzQgLTIuMjQgeiBNODQuNTkwMDAwMDAwMDAwMDIgMjAgbDAgLTEzLjcgbDMuMSAwIGwwIDEwLjg2IGw2LjM2IDAgbDAgMi44NCBsLTkuNDYgMCB6IE05OS43NjAwMDAwMDAwMDAwMiAyMCBsMCAtMTMuNyBsMTAuMDIgMCBsMCAyLjggbC02LjkyIDAgbDAgMi41OCBsNi40IDAgbDAgMi43MiBsLTYuNCAwIGwwIDIuOCBsNi45NCAwIGwwIDIuOCBsLTEwLjA0IDAgeiIvPjwvZz48ZyBpZD0iU3ZnanNHMTAwOSIgZmVhdHVyZUtleT0iZmlBS2pJLTEiIHRyYW5zZm9ybT0ibWF0cml4KDIuNjI2ODM4Njc4ODUyNzc4LDAsMCwyLjYyNjgzODY3ODg1Mjc3OCwtMi4yMDY1NDQ4OTEwNjAxMDY3LDIyMi4xODY0MzM3MDg1NTc4NCkiIGZpbGw9IiNmZmYiPjxwYXRoIGQ9Ik0xMCAxNS4xNCBsLTYuMDYgMCBsMCA0Ljg2IGwtMy4xIDAgbDAgLTEzLjcgbDkuNjggMCBsMCAyLjg0IGwtNi41OCAwIGwwIDMuMjggbDYuMDYgMCBsMCAyLjcyIHogTTE5LjI3MDAwMDAwMDAwMDAwMyAyMCBsLTMuMSAwIGwwIC0xMy43IGwzLjEgMCBsMCAxMy43IHogTTMzLjcyIDIwIGwtNS41MiAtOC42OCBsMCA4LjY4IGwtMi45OCAwIGwwIC0xMy43IGwzLjM4IDAgbDUuNTIgOC43IGwwIC04LjcgbDIuOTggMCBsMCAxMy43IGwtMy4zOCAwIHogTTUwLjc3IDE0LjkgbC0xLjc4IC01LjM2IGwtMS43OCA1LjM2IGwzLjU2IDAgeiBNNTIuNDcwMDAwMDAwMDAwMDA2IDIwIGwtMC43OCAtMi4zNiBsLTUuMzggMCBsLTAuNzggMi4zNiBsLTMuMTggMCBsNC44NCAtMTMuNyBsMy44IDAgbDQuODIgMTMuNyBsLTMuMzQgMCB6IE02OS41NiAyMCBsLTUuNTIgLTguNjggbDAgOC42OCBsLTIuOTggMCBsMCAtMTMuNyBsMy4zOCAwIGw1LjUyIDguNyBsMCAtOC43IGwyLjk4IDAgbDAgMTMuNyBsLTMuMzggMCB6IE04NS44MzAwMDAwMDAwMDAwMSA4LjkgYy0yLjMyIDAgLTQuMDggMS44NiAtNC4wOCA0LjIyIGMwIDIuNDIgMS43NiA0LjI2IDQuMTggNC4yNiBjMS42OCAwIDIuOTYgLTAuODggMy43NCAtMi4yMiBsMi40MiAxLjY4IGMtMS4zMiAyLjE2IC0zLjM0IDMuNDQgLTYuMTIgMy40NCBjLTQuMjIgMCAtNy4zOCAtMy4xNCAtNy4zOCAtNy4xNiBjMCAtMy45OCAzLjE0IC03LjEgNy4zIC03LjEgYzIuNyAwIDQuODQgMS4xMiA2LjE0IDMuNDIgbC0yLjQ2IDEuNyBjLTAuOCAtMS4zMiAtMiAtMi4yNCAtMy43NCAtMi4yNCB6IE0xMDAuNjggMjAgbC0zLjEgMCBsMCAtMTMuNyBsMy4xIDAgbDAgMTMuNyB6IE0xMTQuMzMwMDAwMDAwMDAwMDEgMTQuOSBsLTEuNzggLTUuMzYgbC0xLjc4IDUuMzYgbDMuNTYgMCB6IE0xMTYuMDMgMjAgbC0wLjc4IC0yLjM2IGwtNS4zOCAwIGwtMC43OCAyLjM2IGwtMy4xOCAwIGw0Ljg0IC0xMy43IGwzLjggMCBsNC44MiAxMy43IGwtMy4zNCAwIHogTTEyNC42MiAyMCBsMCAtMTMuNyBsMy4xIDAgbDAgMTAuODYgbDYuMzYgMCBsMCAyLjg0IGwtOS40NiAwIHoiLz48L2c+PGcgaWQ9IlN2Z2pzRzEwMTAiIGZlYXR1cmVLZXk9InNsb2dhbkZlYXR1cmUtMCIgdHJhbnNmb3JtPSJtYXRyaXgoMC44ODg5OTgxMzM4MjUzOTE3LDAsMCwwLjg4ODk5ODEzMzgyNTM5MTcsMTguNTkxMDYxMjQ4NDM1MDc1LDI5MC44NDM4MTA2NTQyNDk4KSIgZmlsbD0iI2ZmZiI+PHBhdGggZD0iTTEwLjQ0IDcuNzIwMDAwMDAwMDAwMDAxIGwtNC4wOCAwIGwwIDEyLjI4IGwtMS44IDAgbDAgLTEyLjI4IGwtNC4xIDAgbDAuMTIgLTEuNzIgbDkuNzQgMCB6IE0xMy4zMjkgMTQuNDYgbDAgLTguNDYgbDEuOCAwIGwwIDguMzIgYzAgMi43IDEuNTYgNC4wOCAzLjc2IDQuMDggczMuNzggLTEuMzggMy43OCAtNC4wOCBsMCAtOC4zMiBsMS43OCAwIGwwIDguNDYgYzAgMy42NCAtMi4wOCA1Ljc0IC01LjU2IDUuNzQgYy0zLjQ2IDAgLTUuNTYgLTIuMSAtNS41NiAtNS43NCB6IE0zOC43MzggMTEuMDYgYzAgMi4yNiAtMS4wNiA0LjIgLTMuMjQgNC44NCBsMy4wMiA0LjEgbC0yLjE2IDAgbC0yLjg2IC0zLjg4IGwtMy4xNCAwIGwwIDMuODggbC0xLjggMCBsMCAtMTQgbDUuMjggMCBjMy4zIDAgNC45IDIuMjggNC45IDUuMDYgeiBNMzAuMzU4IDcuNjggbDAgNi43NCBsMy40IDAgYzIuMjYgMCAzLjE4IC0xLjY2IDMuMTggLTMuMzYgcy0wLjkyIC0zLjM4IC0zLjE4IC0zLjM4IGwtMy40IDAgeiBNNTEuOTY3IDYgbDEuOCAwIGwwIDE0LjIgbC0wLjIyIDAgbC05LjQgLTkuOTggbDAgOS43OCBsLTEuNzggMCBsMCAtMTQuMiBsMC4yIDAgbDkuNCA5Ljk4IGwwIC05Ljc4IHogTTU3Ljk5NjAwMDAwMDAwMDAxIDIwIGwwIC0xNCBsMS44IDAgbDAgMTQgbC0xLjggMCB6IE03My42MjUgNiBsMS44IDAgbDAgMTQuMiBsLTAuMjIgMCBsLTkuNCAtOS45OCBsMCA5Ljc4IGwtMS43OCAwIGwwIC0xNC4yIGwwLjIgMCBsOS40IDkuOTggbDAgLTkuNzggeiBNOTEuMjU0IDExLjg4IGwwIDYuODYgYy0xLjA4IDAuODIgLTIuNTYgMS40NiAtNC45IDEuNDYgYy00LjQgMCAtNy4yNiAtMy4yIC03LjI2IC03LjIgczMuMDIgLTcuMiA3LjIyIC03LjIgYzEuOTQgMCAzLjU0IDAuNyA0LjggMS43IGwtMC45NCAxLjM2IGMtMS4xIC0wLjg4IC0yLjQ2IC0xLjM0IC0zLjg2IC0xLjM0IGMtMyAwIC01LjM0IDIuMjggLTUuMzQgNS40OCBzMi4xNiA1LjQ2IDUuMzggNS40NiBjMS4yMiAwIDIuMjYgLTAuMjYgMy4xIC0wLjY2IGwwIC00LjE4IGwtMi43IDAgbDAuMTIgLTEuNzQgbDQuMzggMCB6IE0xMDcuNzcyMDAwMDAwMDAwMDIgNiBjNC42NCAwIDcuMiAyLjg0IDcuMiA3IHMtMi41NiA3IC03LjIgNyBsLTQuOCAwIGwwIC0xNCBsNC44IDAgeiBNMTA3Ljg3MjAwMDAwMDAwMDAxIDE4LjI4IGMzLjQgMCA1LjMgLTIuMTIgNS4zIC01LjI4IGMwIC0zLjE4IC0xLjkgLTUuMjggLTUuMyAtNS4yOCBsLTMuMSAwIGwwIDEwLjU2IGwzLjEgMCB6IE0xMjguODQxIDExLjA2IGMwIDIuMjYgLTEuMDYgNC4yIC0zLjI0IDQuODQgbDMuMDIgNC4xIGwtMi4xNiAwIGwtMi44NiAtMy44OCBsLTMuMTQgMCBsMCAzLjg4IGwtMS44IDAgbDAgLTE0IGw1LjI4IDAgYzMuMyAwIDQuOSAyLjI4IDQuOSA1LjA2IHogTTEyMC40NjEwMDAwMDAwMDAwMSA3LjY4IGwwIDYuNzQgbDMuNCAwIGMyLjI2IDAgMy4xOCAtMS42NiAzLjE4IC0zLjM2IHMtMC45MiAtMy4zOCAtMy4xOCAtMy4zOCBsLTMuNCAwIHogTTE0MC44NyAxOC4yOCBsMC4xMiAxLjcyIGwtOC41MiAwIGwwIC0xNCBsOC4xMiAwIGwwLjE0IDEuNzIgbC02LjQ2IDAgbDAgMy40MiBsNC4zOCAwIGwwIDEuNzIgbC00LjM4IDAgbDAgNS40MiBsNi42IDAgeiBNMTUzLjYzOSAyMCBsLTEuMjIgLTIuODQgbC02LjI0IDAgbC0xLjIyIDIuODQgbC0xLjkyIDAgbDYuMTYgLTE0LjIgbDAuMiAwIGw2LjE2IDE0LjIgbC0xLjkyIDAgeiBNMTQ2Ljg5OSAxNS40OCBsNC44IDAgbC0yLjQgLTUuNTQgeiBNMTcxLjc4OCA1LjgwMDAwMDAwMDAwMDAwMSBsMC4yMiAwIGwwIDE0LjIgbC0xLjc4IDAgbDAgLTkuNDIgbC00Ljk2IDYuNDggbC0wLjEyIDAgbC00Ljk2IC02LjQ2IGwwIDkuNCBsLTEuNzggMCBsMCAtMTQuMiBsMC4yIDAgbDYuNiA4LjQgeiBNMTc1LjQ1NyAxOC41NCBjMC44OCAwLjgyIDIuNyAxLjY2IDQuNTIgMS42NiBjMi44IDAgNC41OCAtMS40NCA0LjU4IC0zLjcgYzAgLTEuODQgLTAuODggLTIuOTIgLTMuOTIgLTQuNjQgYy0yLjMyIC0xLjM0IC0yLjg4IC0xLjc4IC0yLjg4IC0yLjY2IGMwIC0wLjk0IDAuODggLTEuNjggMi4zNiAtMS42OCBjMC44NiAwIDIgMC4zOCAyLjY2IDAuOCBsMC45NiAtMS40NCBjLTAuOTQgLTAuNjIgLTIuNDIgLTEuMDggLTMuNiAtMS4wOCBjLTIuNTggMCAtNC4zIDEuNDggLTQuMyAzLjQyIGMwIDEuNzIgMC44NiAyLjU4IDMuNSA0LjAyIGMyLjM0IDEuMjggMy4zIDIuMjIgMy4zIDMuMjQgYzAgMS4yIC0xLjA0IDEuOTIgLTIuNjYgMS45MiBjLTEuNCAwIC0yLjggLTAuNjYgLTMuNSAtMS4zIHogTTE5NS42OTUgMjAgbDAgLTE0IGwxLjggMCBsMCAxNCBsLTEuOCAwIHogTTIxMS4zMjQgNiBsMS44IDAgbDAgMTQuMiBsLTAuMjIgMCBsLTkuNCAtOS45OCBsMCA5Ljc4IGwtMS43OCAwIGwwIC0xNC4yIGwwLjIgMCBsOS40IDkuOTggbDAgLTkuNzggeiBNMjI2LjA5MyA3LjcyMDAwMDAwMDAwMDAwMSBsLTQuMDggMCBsMCAxMi4yOCBsLTEuOCAwIGwwIC0xMi4yOCBsLTQuMSAwIGwwLjEyIC0xLjcyIGw5Ljc0IDAgeiBNMjM1Ljc0MiAyMC4yIGMtNCAwIC03LjE4IC0zLjIgLTcuMTggLTcuMiBzMy4xOCAtNy4yIDcuMTggLTcuMiBzNy4xOCAzLjIgNy4xOCA3LjIgcy0zLjE4IDcuMiAtNy4xOCA3LjIgeiBNMjM1Ljc0MiAxOC40OCBjMy4wNCAwIDUuMzIgLTIuMzggNS4zMiAtNS40OCBzLTIuMjggLTUuNDggLTUuMzIgLTUuNDggYy0zLjA2IDAgLTUuMzQgMi4zOCAtNS4zNCA1LjQ4IHMyLjI4IDUuNDggNS4zNCA1LjQ4IHogTTI2Ny42OCA1LjgwMDAwMDAwMDAwMDAwMSBsMC4yMiAwIGwwIDE0LjIgbC0xLjc4IDAgbDAgLTkuNDIgbC00Ljk2IDYuNDggbC0wLjEyIDAgbC00Ljk2IC02LjQ2IGwwIDkuNCBsLTEuNzggMCBsMCAtMTQuMiBsMC4yIDAgbDYuNiA4LjQgeiBNMjcyLjEyODk5OTk5OTk5OTk2IDIwIGwwIC0xNCBsMS44IDAgbDAgMTQgbC0xLjggMCB6IE0yODguMzM3OTk5OTk5OTk5OTcgMTEuMDYgYzAgMi4yNiAtMS4wNiA0LjIgLTMuMjQgNC44NCBsMy4wMiA0LjEgbC0yLjE2IDAgbC0yLjg2IC0zLjg4IGwtMy4xNCAwIGwwIDMuODggbC0xLjggMCBsMCAtMTQgbDUuMjggMCBjMy4zIDAgNC45IDIuMjggNC45IDUuMDYgeiBNMjc5Ljk1Nzk5OTk5OTk5OTk3IDcuNjggbDAgNi43NCBsMy40IDAgYzIuMjYgMCAzLjE4IC0xLjY2IDMuMTggLTMuMzYgcy0wLjkyIC0zLjM4IC0zLjE4IC0zLjM4IGwtMy40IDAgeiBNMzAxLjE2NyAyMCBsLTEuMjIgLTIuODQgbC02LjI0IDAgbC0xLjIyIDIuODQgbC0xLjkyIDAgbDYuMTYgLTE0LjIgbDAuMiAwIGw2LjE2IDE0LjIgbC0xLjkyIDAgeiBNMjk0LjQyNyAxNS40OCBsNC44IDAgbC0yLjQgLTUuNTQgeiBNMzA1LjM3NiAxMyBjMCAtNC4wNCAzLjE4IC03LjIgNy4xOCAtNy4yIGMxLjY4IDAgMy4yOCAwLjU2IDQuNyAxLjY0IGwtMC45IDEuNCBjLTEuMTggLTAuOSAtMi40IC0xLjM0IC0zLjggLTEuMzQgYy0zLjAyIDAgLTUuMzggMi40MiAtNS4zOCA1LjUgczIuMzggNS41IDUuMzggNS41IGMxLjUyIDAgMi44MiAtMC40OCAzLjggLTEuNDIgbDAuOTIgMS4zOCBjLTEuMjIgMS4xIC0yLjk0IDEuNzQgLTQuNzIgMS43NCBjLTQgMCAtNy4xOCAtMy4xOCAtNy4xOCAtNy4yIHogTTMyMi41MjUgMTguMjggbDUuOTIgMCBsLTAuMTIgMS43MiBsLTcuNiAwIGwwIC0xNCBsMS44IDAgbDAgMTIuMjggeiBNMzM5Ljg3NCAxOC4yOCBsMC4xMiAxLjcyIGwtOC41MiAwIGwwIC0xNCBsOC4xMiAwIGwwLjE0IDEuNzIgbC02LjQ2IDAgbDAgMy40MiBsNC4zOCAwIGwwIDEuNzIgbC00LjM4IDAgbDAgNS40MiBsNi42IDAgeiBNMzQyLjY2MyAxOC41NCBjMC44OCAwLjgyIDIuNyAxLjY2IDQuNTIgMS42NiBjMi44IDAgNC41OCAtMS40NCA0LjU4IC0zLjcgYzAgLTEuODQgLTAuODggLTIuOTIgLTMuOTIgLTQuNjQgYy0yLjMyIC0xLjM0IC0yLjg4IC0xLjc4IC0yLjg4IC0yLjY2IGMwIC0wLjk0IDAuODggLTEuNjggMi4zNiAtMS42OCBjMC44NiAwIDIgMC4zOCAyLjY2IDAuOCBsMC45NiAtMS40NCBjLTAuOTQgLTAuNjIgLTIuNDIgLTEuMDggLTMuNiAtMS4wOCBjLTIuNTggMCAtNC4zIDEuNDggLTQuMyAzLjQyIGMwIDEuNzIgMC44NiAyLjU4IDMuNSA0LjAyIGMyLjM0IDEuMjggMy4zIDIuMjIgMy4zIDMuMjQgYzAgMS4yIC0xLjA0IDEuOTIgLTIuNjYgMS45MiBjLTEuNCAwIC0yLjggLTAuNjYgLTMuNSAtMS4zIHoiLz48L2c+CgkJCTwvZz4KCQk8L3N2Zz4=";

// ─── Live Rates (auto-updates date daily) ─────────────────────
var _today = new Date();
var _dateStr = _today.toLocaleDateString("en-CA", { month: "long", day: "numeric", year: "numeric" });
var LR = {
  variable5:     3.35,
  fixed5insured: 4.04,
  fixed5conv:    4.29,
  fixed3:        4.14,
  prime:         4.45,
  stressFloor:   5.25,
  bPremium:      1.00,
  asOf:          _dateStr,
};
var B_RATE = LR.fixed5insured + LR.bPremium; // 5.04%

// ─── Math ──────────────────────────────────────────────────────
function calcPmt(principal, annualRate, years, freq) {
  freq = freq || "monthly";
  var nMap = { monthly: 12, biweekly: 26, biweeklyAcc: 26, weekly: 52 };
  var n = nMap[freq] || 12;
  var r = annualRate / 100 / n;
  var p = years * n;
  if (!r || !principal || principal <= 0) return 0;
  return principal * (r * Math.pow(1 + r, p)) / (Math.pow(1 + r, p) - 1);
}

function buildSched(principal, annualRate, years, freq) {
  freq = freq || "monthly";
  var nMap = { monthly: 12, biweekly: 26, biweeklyAcc: 26, weekly: 52 };
  var n = nMap[freq] || 12;
  var r = annualRate / 100 / n;
  var payment = calcPmt(principal, annualRate, years, freq);
  var bal = principal;
  var rows = [];
  for (var yr = 1; yr <= years && bal > 0.01; yr++) {
    var yP = 0, yI = 0;
    for (var pp = 0; pp < n && bal > 0.01; pp++) {
      var i = bal * r;
      var pr = Math.min(payment - i, bal);
      yI += i; yP += pr; bal = Math.max(bal - pr, 0);
    }
    rows.push({ year: yr, principal: Math.round(yP), interest: Math.round(yI), balance: Math.round(bal) });
  }
  return rows;
}

function minDP(price) {
  if (price > 1500000) return price * 0.20;
  if (price <= 500000) return price * 0.05;
  return 25000 + (price - 500000) * 0.10;
}

function cmhcIns(dp, price) {
  if (!price || price > 1500000 || dp / price >= 0.20) return 0;
  var base = price - dp;
  var ltv = base / price;
  var r = 0.04;
  if (ltv <= 0.65) r = 0.006;
  else if (ltv <= 0.75) r = 0.017;
  else if (ltv <= 0.80) r = 0.024;
  else if (ltv <= 0.85) r = 0.028;
  else if (ltv <= 0.90) r = 0.031;
  return base * r;
}

function maxByGDS(income, rate, years, gdsLimit) {
  var gl = income * gdsLimit / 12;
  var r = rate / 100 / 12;
  var n = years * 12;
  if (!r) return gl * n;
  return gl * (Math.pow(1 + r, n) - 1) / (r * Math.pow(1 + r, n));
}

function lttCalc(price, prov, ft) {
  var t = 0;
  if (prov === "ON") {
    if (price <= 55000) t = price * 0.005;
    else if (price <= 250000) t = 275 + (price - 55000) * 0.01;
    else if (price <= 400000) t = 2225 + (price - 250000) * 0.015;
    else if (price <= 2000000) t = 4475 + (price - 400000) * 0.02;
    else t = 36475 + (price - 2000000) * 0.025;
    if (ft) t = Math.max(0, t - 4000);
  } else if (prov === "BC") {
    if (price <= 200000) t = price * 0.01;
    else if (price <= 2000000) t = 2000 + (price - 200000) * 0.02;
    else t = 38000 + (price - 2000000) * 0.03;
    if (ft && price <= 835000) t = Math.max(0, t - 8000);
  } else if (prov === "AB") { t = 0;
  } else if (prov === "QC") {
    if (price <= 50000) t = price * 0.005;
    else if (price <= 250000) t = 250 + (price - 50000) * 0.01;
    else if (price <= 500000) t = 2250 + (price - 250000) * 0.015;
    else t = 6000 + (price - 500000) * 0.02;
  } else if (prov === "MB") {
    if (price <= 30000) t = 0;
    else if (price <= 90000) t = (price - 30000) * 0.005;
    else if (price <= 150000) t = 300 + (price - 90000) * 0.01;
    else if (price <= 200000) t = 900 + (price - 150000) * 0.015;
    else t = 1650 + (price - 200000) * 0.02;
  } else { t = price * 0.015; }
  return Math.round(t);
}

// ─── Formatting ────────────────────────────────────────────────
function cma(n) { return Math.round(n || 0).toLocaleString("en-CA"); }
function fd(n) { return "$" + cma(n); }
function fp(n, d) { return (+(n || 0)).toFixed(d !== undefined ? d : 1) + "%"; }
function mc(v, l) {
  if (l === null) return GRN;
  if (v <= l * 0.70) return GRN;
  if (v <= l) return AMB;
  return RED;
}

// ─── Styles ────────────────────────────────────────────────────
var S = {
  lbl: { display: "block", fontSize: 10, fontWeight: 700, color: SUB, textTransform: "uppercase", letterSpacing: 0.7, marginBottom: 5 },
  pre: { padding: "11px 12px", background: BG, color: MUT, fontWeight: 700, fontSize: 13, borderRight: "1px solid " + BDR, userSelect: "none", flexShrink: 0 },
  suf: { padding: "11px 12px", background: BG, color: MUT, fontWeight: 600, fontSize: 12, borderLeft: "1px solid " + BDR, userSelect: "none", flexShrink: 0 },
  fld: { flex: 1, border: "none", outline: "none", padding: "11px 12px", fontSize: 15, fontWeight: 600, color: TXT, background: "transparent", minWidth: 0 },
  g2:  { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
};

function inputWrap(focused) {
  return { display: "flex", alignItems: "center", border: "1.5px solid " + (focused ? TEAL : BDR), borderRadius: 10, overflow: "hidden", background: "#fff", transition: "all 0.15s", boxShadow: focused ? ("0 0 0 3px " + TEALX) : "none" };
}

// ─── Inputs ────────────────────────────────────────────────────
function CurrencyInput(props) {
  var label = props.label, value = props.value, onChange = props.onChange, hint = props.hint, suf = props.suf, small = props.small;
  var focused = useState(false);
  var f = focused[0], setF = focused[1];
  var rawState = useState("");
  var raw = rawState[0], setRaw = rawState[1];

  function onFocus() { setF(true); setRaw(value === 0 ? "" : String(Math.round(value))); }
  function onBlur() { setF(false); onChange(Number(raw.replace(/,/g, "")) || 0); setRaw(""); }
  function onChg(e) { var v = e.target.value.replace(/[^0-9]/g, ""); setRaw(v); onChange(Number(v) || 0); }

  return (
    <div style={{ marginBottom: small ? 10 : 14 }}>
      {label && <label style={S.lbl}>{label}</label>}
      <div style={inputWrap(f)}>
        <span style={S.pre}>$</span>
        <input type="text" inputMode="numeric" value={f ? raw : cma(value)} onFocus={onFocus} onBlur={onBlur} onChange={onChg} style={S.fld} />
        {suf && <span style={S.suf}>{suf}</span>}
      </div>
      {hint && <div style={{ fontSize: 10, color: MUT, marginTop: 3, lineHeight: 1.4 }}>{hint}</div>}
    </div>
  );
}

function NumInput(props) {
  var label = props.label, value = props.value, onChange = props.onChange, suf = props.suf, pre = props.pre, hint = props.hint, min = props.min, max = props.max, small = props.small;
  if (min === undefined) min = 0;
  if (max === undefined) max = 999;
  var focused = useState(false);
  var f = focused[0], setF = focused[1];
  return (
    <div style={{ marginBottom: small ? 10 : 14 }}>
      {label && <label style={S.lbl}>{label}</label>}
      <div style={inputWrap(f)}>
        {pre && <span style={S.pre}>{pre}</span>}
        <input type="number" value={value} min={min} max={max}
          onChange={function(e) { onChange(Number(e.target.value)); }}
          onFocus={function() { setF(true); }} onBlur={function() { setF(false); }}
          style={{ flex: 1, border: "none", outline: "none", padding: "11px 14px", fontSize: 15, fontWeight: 600, color: TXT, background: "transparent", minWidth: 0 }} />
        {suf && <span style={S.suf}>{suf}</span>}
      </div>
      {hint && <div style={{ fontSize: 10, color: MUT, marginTop: 3, lineHeight: 1.4 }}>{hint}</div>}
    </div>
  );
}

function SelInput(props) {
  var label = props.label, value = props.value, onChange = props.onChange, opts = props.opts;
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={S.lbl}>{label}</label>}
      <select value={value} onChange={function(e) { onChange(e.target.value); }}
        style={{ width: "100%", border: "1.5px solid " + BDR, borderRadius: 10, padding: "11px 12px", fontSize: 14, fontWeight: 600, color: TXT, background: "#fff", outline: "none", appearance: "none", cursor: "pointer" }}>
        {opts.map(function(o) { return <option key={o.v} value={o.v}>{o.l}</option>; })}
      </select>
    </div>
  );
}

// ─── Atoms ─────────────────────────────────────────────────────
function Chips(props) {
  var value = props.value, onChange = props.onChange, opts = props.opts;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
      {opts.map(function(pair) {
        var k = pair[0], v = pair[1];
        var active = value === k;
        return (
          <button key={k} onClick={function() { onChange(k); }}
            style={{ padding: "6px 13px", borderRadius: 20, border: "1.5px solid " + (active ? TEAL : BDR), cursor: "pointer", fontSize: 12, fontWeight: 600, background: active ? TEALX : "#fff", color: active ? TEAL : SUB }}>
            {v}
          </button>
        );
      })}
    </div>
  );
}

function Toggle(props) {
  var label = props.label, value = props.value, onChange = props.onChange;
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 0" }}>
      <span style={{ fontSize: 13, color: TXT }}>{label}</span>
      <div onClick={function() { onChange(!value); }}
        style={{ width: 42, height: 24, borderRadius: 12, background: value ? TEAL : MUT, position: "relative", cursor: "pointer", transition: "background 0.2s", flexShrink: 0 }}>
        <div style={{ position: "absolute", top: 3, left: value ? 21 : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
      </div>
    </div>
  );
}

function Row(props) {
  var label = props.label, value = props.value, color = props.color, sub = props.sub, bold = props.bold, large = props.large, last = props.last;
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: last ? "none" : ("1px solid " + BG) }}>
      <div>
        <div style={{ fontSize: 13, color: SUB, fontWeight: bold ? 700 : 400 }}>{label}</div>
        {sub && <div style={{ fontSize: 10, color: MUT, marginTop: 1 }}>{sub}</div>}
      </div>
      <div style={{ fontSize: large ? 18 : 14, fontWeight: 700, color: color || TXT }}>{value}</div>
    </div>
  );
}

function Card(props) {
  return (
    <div style={{ background: CARD, borderRadius: 14, padding: "6px 16px 8px", marginBottom: props.mb !== undefined ? props.mb : 14, border: "1px solid " + BDR, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
      {props.children}
    </div>
  );
}

function HeroPill(props) {
  return (
    <div style={{ background: NAVY, borderRadius: 18, padding: "20px", marginBottom: 14, textAlign: "center" }}>
      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: 1.2, fontWeight: 600, marginBottom: 6 }}>{props.label}</div>
      <div style={{ fontSize: 36, fontWeight: 800, color: "#fff", letterSpacing: -1.5, lineHeight: 1 }}>{props.value}</div>
      {props.sub && <div style={{ fontSize: 12, color: TEAL, marginTop: 7 }}>{props.sub}</div>}
    </div>
  );
}

function SubTabs(props) {
  var tabs = props.tabs, active = props.active, onChange = props.onChange;
  return (
    <div style={{ display: "flex", background: BG, borderRadius: 12, padding: 4, marginBottom: 18, border: "1px solid " + BDR }}>
      {tabs.map(function(pair) {
        var k = pair[0], v = pair[1];
        var isActive = active === k;
        return (
          <button key={k} onClick={function() { onChange(k); }}
            style={{ flex: 1, padding: "8px 4px", border: "none", cursor: "pointer", fontSize: 11, fontWeight: 600, borderRadius: 9, background: isActive ? "#fff" : "transparent", color: isActive ? TEAL : MUT, boxShadow: isActive ? "0 1px 4px rgba(0,0,0,0.08)" : "none" }}>
            {v}
          </button>
        );
      })}
    </div>
  );
}

function Alert(props) {
  var type = props.type;
  var map = { info: [BLUL, BLU, "ℹ️"], warn: [AMBL, AMB, "⚠️"], ok: [GRNL, GRN, "✅"], err: [REDL, RED, "❌"] };
  var arr = map[type] || map.info;
  return (
    <div style={{ background: arr[0], border: "1px solid " + arr[1] + "40", borderRadius: 12, padding: "11px 14px", fontSize: 12, color: arr[1], marginBottom: 14, lineHeight: 1.5 }}>
      {arr[2]} {props.children}
    </div>
  );
}

function PieTip(props) {
  var active = props.active, payload = props.payload;
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{ background: "#fff", border: "1px solid " + BDR, borderRadius: 8, padding: "7px 12px", fontSize: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
      <div style={{ fontWeight: 700, color: payload[0].payload.color }}>{payload[0].name}</div>
      <div style={{ fontWeight: 600, color: TXT }}>{fd(payload[0].value)}</div>
    </div>
  );
}

function ChTip(props) {
  var active = props.active, payload = props.payload, label = props.label;
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{ background: "#fff", border: "1px solid " + BDR, borderRadius: 8, padding: "8px 12px", fontSize: 11, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
      <div style={{ fontWeight: 700, color: SUB, marginBottom: 3 }}>{"Year " + label}</div>
      {payload.map(function(p, i) { return <div key={i} style={{ color: p.color, fontWeight: 600 }}>{p.name + ": " + fd(p.value)}</div>; })}
    </div>
  );
}

function RatioMeter(props) {
  var label = props.label, value = props.value, limit = props.limit, isNull = props.isNull;
  if (isNull) {
    return (
      <div style={{ marginBottom: 10, padding: "8px 12px", background: BLUL, borderRadius: 8, fontSize: 11, color: BLU }}>
        <strong>{label}:</strong> Not applicable — equity-based
      </div>
    );
  }
  var color = mc(value, limit);
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: TXT }}>{label}</span>
        <span style={{ fontSize: 11, fontWeight: 800, color: color }}>{fp(value) + " / " + limit + "%"}</span>
      </div>
      <div style={{ height: 6, background: BG, borderRadius: 3, overflow: "hidden" }}>
        <div style={{ height: "100%", width: Math.min(value / limit * 100, 100) + "%", background: color, borderRadius: 3 }} />
      </div>
    </div>
  );
}

// ─── Rates Banner ──────────────────────────────────────────────
function RatesBanner(props) {
  var onSelect = props.onSelect, hideBLender = props.hideBLender;
  var activeRateS = useState(LR.variable5);
  var activeRate = activeRateS[0], setActiveRate = activeRateS[1];
  var rates = [
    { l: "5yr Variable", v: LR.variable5, tag: "Lowest", tagColor: "#FF6B1A" },
    { l: "5yr Fixed", v: LR.fixed5conv },
    { l: "5yr Fixed (Insured)", v: LR.fixed5insured, tag: "Popular", tagColor: TEAL },
    { l: "Prime Rate", v: LR.prime, noClick: true },
  ];
  if (!hideBLender) rates.push({ l: "B-Lender Fixed", v: B_RATE, amber: true });
  return (
    <div style={{ background: "#fff", border: "1px solid " + BDR, borderRadius: 14, padding: "12px 16px", marginBottom: 16, boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: TXT }}>Today's Rates</span>
        <span style={{ fontSize: 10, color: MUT }}>{"Rates as of " + LR.asOf}</span>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {rates.map(function(r) {
          var isActive = activeRate === r.v && !r.noClick;
          return (
            <button key={r.l} onClick={r.noClick ? undefined : function() { setActiveRate(r.v); onSelect(r.v); }}
              style={{ flex: 1, minWidth: 80, padding: "10px 12px", borderRadius: 10, textAlign: "center",
                border: "2px solid " + (isActive ? TEAL : (r.amber ? AMB + "50" : BDR)),
                background: isActive ? TEALX : (r.amber ? AMBL : "#fff"),
                cursor: r.noClick ? "default" : "pointer", transition: "all 0.15s" }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: r.amber ? AMB : r.noClick ? SUB : (isActive ? TEAL : TXT), letterSpacing: -0.5 }}>{fp(r.v, 2)}</div>
              <div style={{ fontSize: 9, color: r.noClick ? MUT : (isActive ? TEAL : SUB), fontWeight: 600, marginTop: 2, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                {r.l}
                {r.tag && <span style={{ background: r.tagColor || TEAL, color: "#fff", borderRadius: 4, padding: "1px 5px", fontSize: 8, fontWeight: 700 }}>{r.tag}</span>}
              </div>
            </button>
          );
        })}

      </div>
    </div>
  );
}

// ─── Lender Card ───────────────────────────────────────────────
function LenderCard(props) {
  var title = props.title, badge = props.badge, accent = props.accent;
  var rate = props.rate, stressRate = props.stressRate;
  var payment = props.payment, mortgage = props.mortgage, ins = props.ins;
  var dpAmt = props.dpAmt, dpPct = props.dpPct, totalInt = props.totalInt;
  var amortYrs = props.amortYrs, sub1 = props.sub1, sub2 = props.sub2;
  var gds = props.gds, tds = props.tds, gdsLim = props.gdsLim, tdsLim = props.tdsLim;
  var hideGDSTDS = props.hideGDSTDS, affordMode = props.affordMode, maxPrice = props.maxPrice;
  var pass = gdsLim === null ? true : (gds <= gdsLim && tds <= tdsLim);

  return (
    <div style={{ flex: 1, minWidth: 220, background: CARD, borderRadius: 16, border: "2px solid " + accent + "30", overflow: "hidden" }}>
      <div style={{ background: accent, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#fff" }}>{title}</div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", marginTop: 1 }}>{"Rate: " + fp(rate, 2) + " · Stress: " + fp(stressRate, 2)}</div>
        </div>
        <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: 8, padding: "3px 10px", fontSize: 10, fontWeight: 700, color: "#fff" }}>{badge}</div>
      </div>
      <div style={{ padding: "14px 16px 14px", textAlign: "center", borderBottom: "1px solid " + BG }}>
        {affordMode ? (
          <div>
            <div style={{ fontSize: 10, color: MUT, textTransform: "uppercase", letterSpacing: 0.8, fontWeight: 600, marginBottom: 4 }}>Max Home Price</div>
            <div style={{ fontSize: 30, fontWeight: 800, color: accent, letterSpacing: -1 }}>{fd(maxPrice)}</div>
            <div style={{ fontSize: 12, color: MUT, marginTop: 4 }}>{"Monthly Payment: "}<strong style={{ color: TXT }}>{fd(payment)}</strong></div>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: 10, color: MUT, textTransform: "uppercase", letterSpacing: 0.8, fontWeight: 600, marginBottom: 4 }}>Monthly Payment</div>
            <div style={{ fontSize: 30, fontWeight: 800, color: accent, letterSpacing: -1 }}>{fd(payment)}</div>
          </div>
        )}
        {sub1 && <div style={{ fontSize: 11, color: MUT, marginTop: 3 }}>{sub1}</div>}
      </div>
      <div style={{ padding: "12px 16px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
          {[
            ["Down Payment", fd(dpAmt) + " (" + fp(dpPct) + ")"],
            ["Mortgage", fd(mortgage)],
            ["CMHC", ins > 0 ? fd(ins) : "None"],
            affordMode ? ["Amortization", amortYrs + " yrs"] : ["Total Interest", fd(totalInt)]
          ].map(function(pair) {
            var l = pair[0], v = pair[1];
            return (
              <div key={l}>
                <div style={{ fontSize: 9, color: MUT, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 }}>{l}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: (l === "CMHC" && ins > 0) ? AMB : TXT }}>{v}</div>
              </div>
            );
          })}
        </div>
        {!hideGDSTDS && gdsLim !== undefined && (
          <div>
            <RatioMeter label="GDS" value={gds} limit={gdsLim} isNull={gdsLim === null} />
            <RatioMeter label="TDS" value={tds} limit={tdsLim} isNull={tdsLim === null} />
            {gdsLim !== null && (
              <div style={{ background: pass ? GRNL : AMBL, borderRadius: 8, padding: "7px 12px", textAlign: "center", marginTop: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: pass ? GRN : AMB }}>{pass ? "✓ Qualifies" : "⚠ Marginal"}</span>
              </div>
            )}
          </div>
        )}
        {sub2 && <div style={{ fontSize: 10, color: MUT, marginTop: 8, lineHeight: 1.5 }}>{sub2}</div>}
      </div>
    </div>
  );
}

// ─── Disclaimer Footer ─────────────────────────────────────────
var DISC_SHORT = "Rates and calculations are for informational purposes only and subject to change. Final approval subject to lender review and credit qualification. Miracle Financial — FSRA Lic. # 13766.";
var DISC_FULL  = "Any rates, terms, or calculations provided are for informational purposes only and subject to change without notice. This information is confidential and intended for the designated recipient only. Sharing with any third party without written consent of Miracle Financial is strictly prohibited. Final mortgage approval is always subject to full lender review, credit qualification, income verification, and supporting documentation. Miracle Financial is a licensed mortgage brokerage — FSRA Licence # 13766. Nothing displayed constitutes a commitment to lend or a guarantee of rates. © " + new Date().getFullYear() + " Miracle Financial. All rights reserved.";

function DisclaimerFooter() {
  var expanded = useState(false);
  var exp = expanded[0], setExp = expanded[1];
  return (
    <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 200, background: "#fff", borderTop: "1px solid " + BDR, boxShadow: "0 -2px 12px rgba(0,0,0,0.06)", padding: exp ? "12px 20px 14px" : "8px 20px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto", display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div style={{ fontSize: 10, color: MUT, lineHeight: 1.6, flex: 1 }}>
          <strong style={{ color: SUB, marginRight: 4 }}>DISCLAIMER:</strong>
          {exp ? DISC_FULL : DISC_SHORT}
        </div>
        <button onClick={function() { setExp(!exp); }}
          style={{ border: "1px solid " + BDR, background: BG, color: SUB, borderRadius: 6, padding: "3px 10px", fontSize: 10, fontWeight: 600, cursor: "pointer", flexShrink: 0, marginTop: 1 }}>
          {exp ? "▾ Less" : "▸ Full"}
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// TAB 1 — PURCHASE
// ══════════════════════════════════════════════════════════════
function PurchaseTab() {
  var priceState = useState(750000);  var price = priceState[0],  setPrice  = priceState[1];
  var dpState    = useState(150000);  var dp    = dpState[0],    setDp     = dpState[1];
  var dpModeS    = useState("dollar");var dpMode= dpModeS[0],   setDpMode = dpModeS[1];
  var rateState  = useState(null); var rateOverride = rateState[0], setRate = rateState[1];
  var amortState = useState(30);      var amort = amortState[0], setAmort  = amortState[1];
  var termState  = useState(5);       var term  = termState[0],  setTerm   = termState[1];
  var freqState  = useState("monthly");var freq = freqState[0],  setFreq   = freqState[1];
  var viewState  = useState("term");  var view  = viewState[0],  setView   = viewState[1];

  var safePrice  = Math.max(price || 0, 1);
  var dpSafe     = Math.max(dp || 0, 0);
  var dpPct      = dpSafe / safePrice * 100;
  var ins        = cmhcIns(dpSafe, safePrice);
  var isInsured  = ins > 0;
  var autoRate   = isInsured ? LR.fixed5insured : LR.fixed5conv;
  var rate       = rateOverride !== null ? rateOverride : autoRate;
  var maxAm      = isInsured ? 25 : 35;
  var am         = Math.min(amort, maxAm);
  var mort       = Math.max(safePrice - dpSafe + ins, 0);
  var pmtVal     = calcPmt(mort, rate, am, freq);
  var schedule   = mort > 0 ? buildSched(mort, rate, am, freq) : [];
  var totInt     = schedule.reduce(function(s, d) { return s + d.interest; }, 0);
  var sr         = Math.max(rate + 2, LR.stressFloor);
  var freqN      = { monthly: 12, biweekly: 26, biweeklyAcc: 26, weekly: 52 }[freq] || 12;
  var freqLbl    = { monthly: "Monthly", biweekly: "Bi-Weekly", biweeklyAcc: "Bi-Wkly Acc.", weekly: "Weekly" }[freq];
  var mortType   = isInsured ? "Insured" : (safePrice <= 1500000 && am <= 25 ? "Insurable" : "Conventional");
  var termRows   = schedule.slice(0, Math.min(term, schedule.length));
  var termInt    = termRows.reduce(function(s, d) { return s + d.interest; }, 0);
  var termPrin   = termRows.reduce(function(s, d) { return s + d.principal; }, 0);
  var termBal    = schedule[Math.min(term, schedule.length) - 1] ? schedule[Math.min(term, schedule.length) - 1].balance : 0;

  // Pre-compute all strings — no template literals in JSX
  var dpPctSafe  = isFinite(dpPct) ? dpPct : 0;
  var cmhcStr    = isInsured ? (" · CMHC: " + fd(ins)) : " · No CMHC";
  var minDpVal   = minDP(safePrice);
  var hintDollar = fp(dpPctSafe) + " · Min: " + fd(minDpVal) + cmhcStr;
  var hintPct    = "= " + fd(dpSafe) + " · Min: " + fp(minDpVal / safePrice * 100) + cmhcStr;
  var amHint     = isInsured ? "Max 25 yrs (insured)" : "Up to 35 yrs (conv.)";
  var srHint     = "Stress test: " + fp(sr, 2);
  var heroLabel  = freqLbl + " Payment · " + am + "yr · " + mortType;
  var rateInfo   = "Rate: " + fp(rate, 2) + " · Stress Test: " + fp(sr, 2);
  var dpDisplay  = fd(dpSafe) + " (" + fp(dpPctSafe) + ")";

  return (
    <div>
      <RatesBanner onSelect={setRate} hideBLender={true} />
      <div className="two-col">
        <div>
          <CurrencyInput label="Home Price" value={price}
            onChange={function(v) {
              var p = Math.max(v || 0, 0);
              setPrice(p);
              if (dpMode === "pct" && p > 0) setDp(Math.round(p * dpPctSafe / 100));
            }} />
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
              <label style={S.lbl}>Down Payment</label>
              <div style={{ display: "flex", gap: 2, background: BG, borderRadius: 8, padding: 2, border: "1px solid " + BDR }}>
                {[["dollar", "$"], ["pct", "%"]].map(function(pair) {
                  var k = pair[0], v = pair[1];
                  return (
                    <button key={k} onClick={function() { setDpMode(k); }}
                      style={{ padding: "3px 10px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700, background: dpMode === k ? TEAL : "transparent", color: dpMode === k ? "#fff" : MUT }}>
                      {v}
                    </button>
                  );
                })}
              </div>
            </div>
            {dpMode === "dollar"
              ? <CurrencyInput value={dpSafe} onChange={function(v) { setDp(Math.max(v || 0, 0)); }} hint={hintDollar} />
              : <NumInput value={parseFloat(dpPctSafe.toFixed(1))} onChange={function(v) { setDp(Math.round(safePrice * v / 100)); }} suf="%" hint={hintPct} min={0} max={100} />
            }
            {dpSafe < minDpVal && safePrice > 0 && (
              <Alert type="err">{"Min down for " + fd(safePrice) + " is " + fd(minDpVal) + " (" + fp(minDpVal / safePrice * 100) + ")"}</Alert>
            )}
          </div>
          <NumInput label="Interest Rate" value={rate} onChange={setRate} suf="%" hint={srHint} min={0.5} max={25} />
          <div style={S.g2}>
            <NumInput label="Amortization" value={am} onChange={function(v) { setAmort(v); }} suf="yrs" hint={amHint} min={5} max={35} />
            <NumInput label="Term" value={term} onChange={setTerm} suf="yrs" min={1} max={10} />
          </div>
          <div>
            <label style={S.lbl}>Payment Frequency</label>
            <Chips value={freq} onChange={setFreq} opts={[["monthly", "Monthly"], ["biweekly", "Bi-Weekly"], ["biweeklyAcc", "Bi-Wkly Acc."], ["weekly", "Weekly"]]} />
          </div>
        </div>
        <div>
          <div style={{ background: "linear-gradient(145deg, #0F1E2E 0%, #19304A 100%)", borderRadius: 18, padding: "22px 20px 18px", boxShadow: "0 8px 32px rgba(15,30,46,0.35)", marginBottom: 14, textAlign: "center" }}>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: 1.2, fontWeight: 600, marginBottom: 8 }}>{heroLabel}</div>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 6, lineHeight: 1 }}>
              <div style={{ fontSize: 62, fontWeight: 900, color: "#fff", letterSpacing: -3 }}>{fd(pmtVal)}</div>
              <div style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", fontWeight: 600, paddingBottom: 8 }}>/ mo</div>
            </div>
            <div style={{ fontSize: 11, marginTop: 6, marginBottom: 16 }}>
              <span style={{ color: TEAL, fontWeight: 700 }}>{"Based on " + fp(rate, 2) + " rate"}</span>
              <span style={{ color: "rgba(255,255,255,0.4)" }}>{" · " + am + "-year amortization"}</span>
            </div>
            <a href="https://miracle-financial.mtg-app.com/signup" target="_blank" rel="noreferrer"
              style={{ display: "block", background: "#FF6B1A", color: "#fff", padding: "13px 20px", borderRadius: 12,
                fontSize: 14, fontWeight: 800, textDecoration: "none", boxShadow: "0 4px 18px rgba(255,107,26,0.45)",
                letterSpacing: -0.2 }}>
              Get Pre-Approved for This Amount →
            </a>
            <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 14 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </div>
                <span style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", fontWeight: 600, textAlign: "center" }}>No Credit Impact</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </div>
                <span style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", fontWeight: 600, textAlign: "center" }}>2-Minute Approval</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg>
                </div>
                <span style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", fontWeight: 600, textAlign: "center" }}>Licensed Broker</span>
              </div>
            </div>
          </div>
          <Card>
            <Row label="Purchase Price" value={fd(safePrice)} />
            <Row label="Down Payment" value={dpDisplay} color={GRN} />
            {ins > 0 && <Row label="CMHC Insurance" value={fd(ins)} color={AMB} sub="Added to mortgage" />}
            <Row label="Mortgage Amount" value={fd(mort)} bold={true} last={true} />
          </Card>
          <div style={{ marginTop: 14 }}>
            <SubTabs tabs={[["term", "Term View"], ["schedule", "Schedule"], ["chart", "Chart"]]} active={view} onChange={setView} />
            {view === "term" && (
              <Card>
                <Row label={(term + "-Year Payments Total")} value={fd(pmtVal * freqN * Math.min(term, schedule.length))} />
                <Row label="Principal Paid" value={fd(termPrin)} color={GRN} />
                <Row label="Interest Paid" value={fd(termInt)} color={RED} />
                <Row label="Balance at Renewal" value={fd(termBal)} bold={true} large={true} last={true} />
              </Card>
            )}
            {view === "schedule" && (
              <div style={{ background: BG, borderRadius: 14, padding: 12, maxHeight: 280, overflowY: "auto", border: "1px solid " + BDR }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                  <thead>
                    <tr>
                      {["Year", "Principal", "Interest", "Total", "Balance"].map(function(h) {
                        return <th key={h} style={{ padding: "4px 8px", textAlign: "right", color: MUT, fontWeight: 700, fontSize: 9, textTransform: "uppercase", paddingBottom: 8 }}>{h}</th>;
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {schedule.map(function(r) {
                      return (
                        <tr key={r.year} style={{ borderBottom: "1px solid " + BDR }}>
                          <td style={{ padding: "5px 8px", textAlign: "right", color: TEAL, fontWeight: 700 }}>{r.year}</td>
                          <td style={{ padding: "5px 8px", textAlign: "right", color: GRN, fontWeight: 600 }}>{fd(r.principal)}</td>
                          <td style={{ padding: "5px 8px", textAlign: "right", color: RED }}>{fd(r.interest)}</td>
                          <td style={{ padding: "5px 8px", textAlign: "right", color: SUB }}>{fd(r.principal + r.interest)}</td>
                          <td style={{ padding: "5px 8px", textAlign: "right", color: TXT, fontWeight: 700 }}>{fd(r.balance)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            {view === "chart" && (
              <div style={{ background: BG, borderRadius: 14, padding: 14, border: "1px solid " + BDR }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: MUT, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 }}>Annual Principal vs. Interest</div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={schedule} margin={{ top: 2, right: 4, left: -16, bottom: 0 }} barSize={8}>
                    <CartesianGrid strokeDasharray="3 3" stroke={BDR} />
                    <XAxis dataKey="year" tick={{ fontSize: 10, fill: MUT }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: MUT }} tickLine={false} axisLine={false} tickFormatter={function(v) { return "$" + Math.round(v / 1000) + "k"; }} />
                    <Tooltip content={<ChTip />} />
                    <Bar dataKey="principal" name="Principal" fill={TEAL} radius={[2, 2, 0, 0]} />
                    <Bar dataKey="interest" name="Interest" fill={REDL} radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// TAB 2 — AFFORDABILITY
// ══════════════════════════════════════════════════════════════
function AffordabilityTab() {
  var incS  = useState(120000);  var income   = incS[0],  setIncome   = incS[1];
  var coS   = useState(0);       var co       = coS[0],   setCo       = coS[1];
  var dpDS  = useState(100000);  var dpDollar = dpDS[0],  setDpDollar = dpDS[1];
  var dpPS  = useState(10);      var dpPctIn  = dpPS[0],  setDpPctIn  = dpPS[1];
  var dpMS  = useState("dollar");var dpMode   = dpMS[0],  setDpMode   = dpMS[1];
  // Separate debt inputs
  var carS  = useState(0);       var carLoan  = carS[0],  setCarLoan  = carS[1];
  var ccS   = useState(0);       var ccPmt    = ccS[0],   setCcPmt    = ccS[1];
  var stuS  = useState(0);       var stuLoan  = stuS[0],  setStuLoan  = stuS[1];
  var othS  = useState(0);       var othDebt  = othS[0],  setOthDebt  = othS[1];
  var rateS = useState(LR.variable5); var aRate = rateS[0], setARate  = rateS[1];
  var amS   = useState(30);      var amort    = amS[0],   setAmort    = amS[1];

  var debt      = carLoan + ccPmt + stuLoan + othDebt;
  var total     = income + co;
  var monthlyInc= total / 12;
  var sr_A      = Math.max(aRate + 2, LR.stressFloor);
  var sr_B      = Math.max(B_RATE + 2, LR.stressFloor);

  // Max mortgage factoring BOTH GDS (32%) and TDS (44%) constraints — take the lower
  // TDS constraint: housing can be at most (44% of income - other debts)
  var tdsRatio_A = monthlyInc > 0 ? Math.max(0, 0.44 - debt / monthlyInc) : 0.44;
  var tdsRatio_B = monthlyInc > 0 ? Math.max(0, 0.60 - debt / monthlyInc) : 0.60;
  var mm_A_gds   = maxByGDS(total, sr_A, amort, 0.32);
  var mm_A_tds   = maxByGDS(total, sr_A, amort, tdsRatio_A);
  var mm_B_gds   = maxByGDS(total, sr_B, amort, 0.60);
  var mm_B_tds   = maxByGDS(total, sr_B, amort, tdsRatio_B);
  var mm_A_base  = Math.min(mm_A_gds, mm_A_tds);
  var mm_B_base  = Math.min(mm_B_gds, mm_B_tds);

  var dp = dpMode === "dollar"
    ? dpDollar
    : Math.max(0, Math.round(mm_A_base * dpPctIn / Math.max(100 - dpPctIn, 1)));

  function handleDpDollar(v) {
    setDpDollar(v);
    var pEst = mm_A_base + v;
    if (pEst > 0) setDpPctIn(parseFloat((v / pEst * 100).toFixed(1)));
    // Auto-clamp amort to 25 when dp drops below 20%
    var newPct = pEst > 0 ? v / pEst * 100 : 0;
    if (newPct < 20 && amort > 25) setAmort(25);
  }
  function handleDpPct(v) {
    setDpPctIn(v);
    setDpDollar(Math.max(0, Math.round(mm_A_base * v / Math.max(100 - v, 1))));
    // Auto-clamp amort to 25 when dp drops below 20%
    if (v < 20 && amort > 25) setAmort(25);
  }

  // A-Lender
  var price_A_est = mm_A_base + dp;
  var isConv_A    = price_A_est > 0 && dp >= price_A_est * 0.20;
  var am_A        = isConv_A ? amort : Math.min(amort, 25);
  var mm_A_gds2   = maxByGDS(total, sr_A, am_A, 0.32);
  var mm_A_tds2   = maxByGDS(total, sr_A, am_A, tdsRatio_A);
  var mm_A        = isConv_A ? mm_A_base : Math.min(mm_A_gds2, mm_A_tds2);
  var price_A     = mm_A + dp;
  var dpPct_A     = price_A > 0 ? dp / price_A * 100 : 0;
  var mPmt_A      = mm_A > 0 ? calcPmt(mm_A, aRate, am_A, "monthly") : 0;
  var gds_A       = monthlyInc > 0 ? mPmt_A / monthlyInc * 100 : 0;
  var tds_A       = monthlyInc > 0 ? (mPmt_A + debt) / monthlyInc * 100 : 0;
  var mortType_A  = !isConv_A ? "Insured" : (am_A <= 25 && price_A <= 1500000 ? "Insurable" : "Conventional");

  // B-Lender: show when dp is >= 20% of A-lender qualifying price (practical threshold)
  var showB    = dpPct_A >= 20;
  var price_B  = mm_B_base + dp;
  var mPmt_B   = mm_B_base > 0 ? calcPmt(mm_B_base, B_RATE, amort, "monthly") : 0;
  var gds_B    = monthlyInc > 0 ? mPmt_B / monthlyInc * 100 : 0;
  var tds_B    = monthlyInc > 0 ? (mPmt_B + debt) / monthlyInc * 100 : 0;
  var dpPct_B  = price_B > 0 ? dp / price_B * 100 : 0;
  // Buying power gain
  var buyingPowerGain = price_B - price_A;

  var dpNeededB  = price_A > 0 ? Math.ceil(price_A * 0.20) : 0;
  var stressNote = "Stress test auto-applied — A: " + fp(sr_A, 2) + " · B: " + fp(sr_B, 2) + " · Combined income: " + fd(total);
  var aCardSub1  = "Max Home Price: " + fd(price_A);
  var aCardSub2  = "GDS 39% · TDS 44% · " + mortType_A + " · " + am_A + "yr";
  var bCardSub1  = "Max Home Price: " + fd(price_B);
  var bCardSub2  = "GDS 60% · TDS 60% · Conventional · " + amort + "yr";
  var bBadge     = "Fixed +" + fp(LR.bPremium, 1);
  var dpHintA    = fp(dpPct_A, 1) + " of max · " + (showB ? "B-lender unlocked ✓" : "Need " + fd(dpNeededB) + " (20%) for B-lender");
  var dpHintP    = "= " + fd(dp) + " · " + (showB ? "B-lender unlocked ✓" : "Need " + fd(dpNeededB) + " (20%) for B-lender");

  return (
    <div>
      <RatesBanner onSelect={setARate} hideBLender={true} />

      {/* Inputs */}
      <div style={{ background: CARD, borderRadius: 16, padding: "16px 20px", border: "1px solid " + BDR, marginBottom: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(155px,1fr))", gap: 12, marginBottom: 14 }}>
          <CurrencyInput label="Annual Gross Income" value={income} onChange={setIncome} small={true} />
          <CurrencyInput label="Co-Applicant Income" value={co} onChange={setCo} hint="Optional" small={true} />
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
              <label style={S.lbl}>Down Payment</label>
              <div style={{ display: "flex", gap: 2, background: BG, borderRadius: 7, padding: 2, border: "1px solid " + BDR }}>
                {[["dollar", "$"], ["pct", "%"]].map(function(pair) {
                  var k = pair[0], v = pair[1];
                  return (
                    <button key={k} onClick={function() { setDpMode(k); }}
                      style={{ padding: "2px 9px", borderRadius: 5, border: "none", cursor: "pointer", fontSize: 10, fontWeight: 700, background: dpMode === k ? TEAL : "transparent", color: dpMode === k ? "#fff" : MUT }}>
                      {v}
                    </button>
                  );
                })}
              </div>
            </div>
            {dpMode === "dollar"
              ? <CurrencyInput value={dpDollar} onChange={handleDpDollar} hint={dpHintA} small={true} />
              : <NumInput value={dpPctIn} onChange={handleDpPct} pre="%" hint={dpHintP} min={1} max={50} small={true} />
            }
          </div>
          <NumInput label="A-Lender Rate" value={aRate} onChange={setARate} suf="%" hint={"B-Lender fixed: " + fp(B_RATE, 2)} min={0.5} max={25} small={true} />
          <NumInput label="Amortization" value={am_A} onChange={setAmort} suf="yrs" hint={isConv_A ? "Up to 30 yrs (conv.)" : "Auto-set to 25 (insured) · Can increase to 30"} min={5} max={30} small={true} />
        </div>

        {/* Separate debt inputs */}
        <div style={{ borderTop: "1px solid " + BG, paddingTop: 12 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: SUB, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 10 }}>
            Monthly Debt Payments
            {debt > 0 && <span style={{ marginLeft: 8, color: AMB, fontWeight: 600, textTransform: "none", fontSize: 11 }}>{"Total: " + fd(debt) + "/mo — reduces buying power"}</span>}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 10 }}>
            <CurrencyInput label="Car Loan / Lease" value={carLoan} onChange={setCarLoan} small={true} />
            <CurrencyInput label="Credit Cards" value={ccPmt} onChange={setCcPmt} small={true} />
            <CurrencyInput label="Student Loan" value={stuLoan} onChange={setStuLoan} small={true} />
            <CurrencyInput label="Other Debts" value={othDebt} onChange={setOthDebt} small={true} />
          </div>
        </div>

        <div style={{ marginTop: 10, padding: "8px 12px", background: AMBL, borderRadius: 10, fontSize: 11, color: AMB }}>{stressNote}</div>
      </div>

      {/* Lender cards — A-lender blurred when B is shown */}
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 16 }}>
        <div style={{ flex: 1, minWidth: 220, filter: showB ? "opacity(0.65)" : "none", transition: "filter 0.3s" }}>
          <LenderCard title="A-Lender (Bank / Monoline)" badge="Standard" accent={TEAL}
            rate={aRate} stressRate={sr_A} payment={mPmt_A} mortgage={mm_A} ins={0}
            dpAmt={dp} dpPct={dpPct_A} totalInt={0}
            gds={gds_A} tds={tds_A} gdsLim={39} tdsLim={44}
            amortYrs={am_A} affordMode={true} maxPrice={price_A}
            sub1={aCardSub1} sub2={aCardSub2} />
        </div>

        {showB ? (
          <div style={{ flex: 1, minWidth: 220 }}>
            <LenderCard title="B-Lender (Alt. Lender)" badge={bBadge} accent={AMB}
              rate={B_RATE} stressRate={sr_B} payment={mPmt_B} mortgage={mm_B_base} ins={0}
              dpAmt={dp} dpPct={dpPct_B} totalInt={0}
              gds={gds_B} tds={tds_B} gdsLim={60} tdsLim={60}
              amortYrs={amort} affordMode={true} maxPrice={price_B}
              sub1={bCardSub1} sub2={bCardSub2} />
          </div>
        ) : (
          <div style={{ flex: 1, minWidth: 220, background: BG, borderRadius: 16, border: "2px dashed " + BDR, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center" }}>
            <div>
              <div style={{ fontSize: 24, marginBottom: 8 }}>🔒</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: SUB, marginBottom: 6 }}>B-Lender Requires 20% Down</div>
              <div style={{ fontSize: 11, color: MUT, lineHeight: 1.6 }}>
                {"Minimum down payment: "}
                <strong style={{ color: AMB }}>{fd(dpNeededB)}</strong>
              </div>
              <button onClick={function() { setDpMode("dollar"); setDpDollar(dpNeededB); setDpPctIn(20); }}
                style={{ marginTop: 12, padding: "7px 16px", borderRadius: 8, border: "1.5px solid " + AMB, background: AMBL, color: AMB, cursor: "pointer", fontSize: 12, fontWeight: 700 }}>
                {"Set to " + fd(dpNeededB)}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* B-Lender buying power banner */}
      {showB && buyingPowerGain > 0 && (
        <div style={{ background: NAVY, borderRadius: 14, padding: "14px 20px", marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <div>
            <div style={{ fontSize: 10, color: TEAL, textTransform: "uppercase", letterSpacing: 1, fontWeight: 700 }}>B-Lender Buying Power</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#fff", marginTop: 2 }}>
              {"Client qualifies for "}
              <span style={{ color: AMB }}>{fd(buyingPowerGain) + " more"}</span>
              {" with B-lender at " + fp(B_RATE, 2)}
            </div>
            <div style={{ fontSize: 11, color: MUT, marginTop: 2 }}>
              {"Monthly payment difference: " + fd(mPmt_B - mPmt_A) + "/mo more · Bridge to A-lender within 1–2 years"}
            </div>
          </div>
          <a href="https://miraclefinancial.ca/booking" target="_blank" rel="noreferrer"
            style={{ background: TEAL, color: NAVY, padding: "9px 18px", borderRadius: 10, fontSize: 12, fontWeight: 800, textDecoration: "none", whiteSpace: "nowrap" }}>
            Discuss Options →
          </a>
        </div>
      )}

      {/* Lender info notes */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div style={{ background: TEALX, border: "1px solid " + TEALM, borderRadius: 12, padding: "12px 14px", fontSize: 12, color: TEAL }}>
          <strong>B-Lender:</strong> Higher GDS/TDS limits (60/60), flexible credit requirements, ideal for bruised credit or non-traditional income. Rates typically 1–2% above A-lender. Bridge to A-lender once established.
        </div>
        <div style={{ background: BLUL, border: "1px solid " + BLU + "20", borderRadius: 12, padding: "12px 14px", fontSize: 12, color: BLU }}>
          <strong>Private Lender:</strong> No GDS/TDS requirements. Equity-based up to 75–80% LTV. Higher rates apply. Contact Miracle Financial to discuss private lending scenarios.
        </div>
      </div>
    </div>
  );
}


// ══════════════════════════════════════════════════════════════
// TAB 3 — DEBT CONSOLIDATION
// ══════════════════════════════════════════════════════════════
var DC_COLS = [TEAL, AMB, RED, "#8B5CF6", "#06B6D4", "#10B981"];
var DC_DEF = [
  { id: "c1", label: "Credit Card 1", rate: 19.99, balance: 8000, minPmt: 240 },
  { id: "c2", label: "Credit Card 2", rate: 22.99, balance: 5500, minPmt: 165 },
  { id: "ca", label: "Car Loan",      rate: 7.99,  balance: 18000, minPmt: 380 },
  { id: "lo", label: "Line of Credit",rate: 9.50,  balance: 12000, minPmt: 120 },
];

function DebtConsolidationTab() {
  var hvS   = useState(750000);  var homeValue   = hvS[0],   setHomeValue   = hvS[1];
  var mbS   = useState(420000);  var mortBal     = mbS[0],   setMortBal     = mbS[1];
  var crS   = useState(5.74);    var currentRate = crS[0],   setCurrentRate = crS[1];
  var nrS   = useState(LR.variable5); var newRate = nrS[0],  setNewRate     = nrS[1];
  var caS   = useState(20);      var currentAmort= caS[0],   setCurrentAmort= caS[1];
  var amS   = useState(30);      var amort       = amS[0],   setAmort       = amS[1];
  var debtsS= useState(DC_DEF);  var debts       = debtsS[0], setDebts      = debtsS[1];
  var ndS   = useState({ label: "", rate: "", balance: "", minPmt: "" });
  var newDebt = ndS[0], setNewDebt = ndS[1];
  var viewS = useState("compare"); var view = viewS[0], setView = viewS[1];

  function upd(id, f, v) { setDebts(function(d) { return d.map(function(x) { return x.id === id ? Object.assign({}, x, { [f]: v }) : x; }); }); }
  function rem(id) { setDebts(function(d) { return d.filter(function(x) { return x.id !== id; }); }); }
  function add() {
    if (!newDebt.label || !newDebt.balance) return;
    setDebts(function(d) { return d.concat([Object.assign({}, newDebt, { id: "d" + Date.now() })]); });
    setNewDebt({ label: "", rate: "", balance: "", minPmt: "" });
  }

  var totalDebtBal  = debts.reduce(function(s, d) { return s + (parseFloat(d.balance) || 0); }, 0);
  var totalDebtPmt  = debts.reduce(function(s, d) { return s + (parseFloat(d.minPmt) || 0); }, 0);
  var avgDebtRate   = totalDebtBal > 0 ? debts.reduce(function(s, d) { return s + (parseFloat(d.rate) || 0) * (parseFloat(d.balance) || 0); }, 0) / totalDebtBal : 0;
  var equity        = Math.max(homeValue - mortBal, 0);
  var maxLoan       = Math.max(homeValue * 0.80, 0);
  var rawNew        = mortBal + totalDebtBal;
  var ltvExceeds    = rawNew > maxLoan && maxLoan > 0;
  var finalPrincipal= Math.max(Math.min(rawNew, maxLoan > 0 ? maxLoan : rawNew), 0);

  // Current: existing mortgage payment at current rate + all debt minimums
  var existingMortPmt = mortBal > 0 ? calcPmt(mortBal, currentRate, currentAmort, "monthly") : 0;
  var currentTotal    = totalDebtPmt + existingMortPmt;

  // New: consolidated mortgage at new rate
  var consolidatedPmt = finalPrincipal > 0 ? calcPmt(finalPrincipal, newRate, amort, "monthly") : 0;
  var savings         = isFinite(currentTotal - consolidatedPmt) ? currentTotal - consolidatedPmt : 0;

  // Rate savings on the mortgage portion alone
  var mortPmtAtNewRate = mortBal > 0 ? calcPmt(mortBal, newRate, currentAmort, "monthly") : 0;
  var mortRateSavings  = existingMortPmt - mortPmtAtNewRate;
  var rateDrop         = currentRate - newRate;

  var pieData = debts.map(function(d, i) { return { name: d.label, value: parseFloat(d.balance) || 0, color: DC_COLS[i % DC_COLS.length] }; });

  return (
    <div>
      {/* Defeat the Rate banner */}
      <div style={{ background: NAVY, borderRadius: 16, padding: "16px 22px", marginBottom: 18, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontSize: 10, color: TEAL, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 700, marginBottom: 6 }}>⚡ Defeat the Rate</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            {/* Mortgage rate drop */}
            <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 10, padding: "8px 14px", textAlign: "center" }}>
              <div style={{ fontSize: 9, color: MUT, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 2 }}>Current Mortgage Rate</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: RED }}>{fp(currentRate, 2)}</div>
            </div>
            <div style={{ fontSize: 22, color: MUT }}>→</div>
            <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 10, padding: "8px 14px", textAlign: "center" }}>
              <div style={{ fontSize: 9, color: MUT, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 2 }}>New Rate</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: GRN }}>{fp(newRate, 2)}</div>
            </div>
            {rateDrop > 0 && (
              <div style={{ background: "rgba(32,170,187,0.15)", borderRadius: 10, padding: "8px 14px", textAlign: "center" }}>
                <div style={{ fontSize: 9, color: TEAL, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 2 }}>Rate Saving</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: TEAL }}>{"-" + fp(rateDrop, 2)}</div>
              </div>
            )}
            {/* Debt rate */}
            {totalDebtBal > 0 && (
              <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 10, padding: "8px 14px", textAlign: "center" }}>
                <div style={{ fontSize: 9, color: MUT, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 2 }}>Avg Debt Rate</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: AMB }}>{fp(avgDebtRate, 2)}</div>
              </div>
            )}
          </div>
          <div style={{ fontSize: 11, color: MUT, marginTop: 8 }}>
            {"Eliminating " + fd(totalDebtBal) + " in high-interest debt · 80% LTV max: " + fd(maxLoan)}
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontSize: 10, color: MUT, marginBottom: 2 }}>Monthly Savings</div>
          <div style={{ fontSize: 30, fontWeight: 800, color: savings > 0 ? GRN : RED }}>{fd(Math.abs(savings))}</div>
          <div style={{ fontSize: 10, color: MUT, marginTop: 2 }}>{"vs. " + fd(currentTotal) + "/mo today"}</div>
        </div>
      </div>

      {/* 3 KPI cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 18 }}>
        {[
          ["Current Monthly", fd(currentTotal), fp(currentRate, 2) + " · all debts", RED],
          ["After Consolidation", fd(consolidatedPmt), fp(newRate, 2) + " · " + amort + " yrs", GRN],
          ["Monthly Savings", fd(Math.abs(savings)), savings > 0 ? "Back in your pocket" : "Review — higher", savings > 0 ? TEAL : RED]
        ].map(function(arr) {
          return (
            <div key={arr[0]} style={{ background: CARD, borderRadius: 14, padding: "14px 16px", textAlign: "center", border: "1px solid " + BDR }}>
              <div style={{ fontSize: 9, color: MUT, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 }}>{arr[0]}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: arr[3] }}>{arr[1]}</div>
              <div style={{ fontSize: 10, color: MUT, marginTop: 3 }}>{arr[2]}</div>
            </div>
          );
        })}
      </div>

      <div className="two-col">
        <div>
          {/* Home equity + rates */}
          <div style={{ background: BLUL, borderRadius: 14, padding: "14px 16px", marginBottom: 14, border: "1px solid " + BLU + "20" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: BLU, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 10 }}>🏠 Home Equity (Refinance — max 80% LTV)</div>
            <CurrencyInput label="Home Value" value={homeValue} onChange={setHomeValue} hint={"Available equity: " + fd(equity) + " · Max loan: " + fd(maxLoan)} small={true} />
            <CurrencyInput label="Current Mortgage Balance" value={mortBal} onChange={setMortBal} small={true} />
            <div style={S.g2}>
              <NumInput label="Current Amortization Remaining" value={currentAmort} onChange={setCurrentAmort} suf="yrs" min={1} max={35} small={true} />
              <div />
            </div>
          </div>

          {/* Rate comparison inputs */}
          <div style={{ background: CARD, borderRadius: 14, padding: "14px 16px", marginBottom: 14, border: "1px solid " + BDR }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: SUB, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 10 }}>📊 Rate Comparison</div>
            <div style={S.g2}>
              <div>
                <NumInput label="Current Rate" value={currentRate} onChange={setCurrentRate} suf="%" hint={"Mortgage pmt: " + fd(existingMortPmt) + "/mo"} min={0.5} max={25} small={true} />
              </div>
              <div>
                <NumInput label="New Rate" value={newRate} onChange={setNewRate} suf="%" hint={"New pmt: " + fd(mortPmtAtNewRate) + "/mo on mortgage"} min={0.5} max={25} small={true} />
              </div>
            </div>
            <RatesBanner onSelect={setNewRate} hideBLender={true} />
            <div style={S.g2}>
              <NumInput label="New Amortization" value={amort} onChange={setAmort} suf="yrs" min={5} max={35} small={true} />
              <div />
            </div>
            {rateDrop > 0 && (
              <div style={{ background: GRNL, border: "1px solid " + GRN + "40", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: GRN }}>
                {"Rate drops " + fp(rateDrop, 2) + " — saving " + fd(mortRateSavings) + "/mo on mortgage alone"}
              </div>
            )}
            {ltvExceeds && <Alert type="err">{"Exceeds 80% LTV (" + fp(rawNew / homeValue * 100) + "). Capped at " + fd(maxLoan) + "."}</Alert>}
          </div>

          <div style={{ background: CARD, borderRadius: 14, padding: "14px 16px", border: "1px solid " + BDR }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: SUB, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 10 }}>💳 Debts to Consolidate</div>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1.3fr 1fr 22px", gap: 4, marginBottom: 6 }}>
              {["Debt", "Rate%", "Balance", "Min Pmt", ""].map(function(h) {
                return <div key={h} style={{ fontSize: 9, fontWeight: 700, color: MUT, textTransform: "uppercase" }}>{h}</div>;
              })}
            </div>
            {debts.map(function(d) {
              return (
                <div key={d.id} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1.3fr 1fr 22px", gap: 4, marginBottom: 5, alignItems: "center" }}>
                  {[["label", "text", d.label, TXT], ["rate", "number", d.rate, RED], ["balance", "number", d.balance, TXT], ["minPmt", "number", d.minPmt, SUB]].map(function(arr) {
                    var f = arr[0], t = arr[1], v = arr[2], col = arr[3];
                    return (
                      <input key={f} type={t} value={v}
                        onChange={function(e) { upd(d.id, f, e.target.value); }}
                        style={{ border: "1.5px solid " + BDR, borderRadius: 7, padding: "6px 7px", fontSize: 11, fontWeight: 600, color: col, outline: "none", textAlign: t === "number" ? "right" : "left", width: "100%", background: "#fff" }} />
                    );
                  })}
                  <button onClick={function() { rem(d.id); }} style={{ border: "none", background: "none", cursor: "pointer", color: MUT, fontSize: 16, fontWeight: 700, padding: 0 }}>×</button>
                </div>
              );
            })}
            <div style={{ borderTop: "1px dashed " + BDR, paddingTop: 8, marginTop: 4 }}>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1.3fr 1fr 22px", gap: 4, alignItems: "center" }}>
                {[["label", "text", "Debt name"], ["rate", "number", "Rate %"], ["balance", "number", "Balance"], ["minPmt", "number", "Min Pmt"]].map(function(arr) {
                  var f = arr[0], t = arr[1], ph = arr[2];
                  return (
                    <input key={f} type={t} placeholder={ph} value={newDebt[f]}
                      onChange={function(e) { setNewDebt(function(nd) { var copy = Object.assign({}, nd); copy[f] = e.target.value; return copy; }); }}
                      style={{ border: "1.5px dashed " + MUT, borderRadius: 7, padding: "6px 7px", fontSize: 11, color: TXT, outline: "none", textAlign: t === "number" ? "right" : "left", width: "100%", background: "#fff" }} />
                  );
                })}
                <button onClick={add} style={{ border: "none", background: TEAL, color: "#fff", cursor: "pointer", borderRadius: 7, fontSize: 14, fontWeight: 700, width: 22, height: 28, display: "grid", placeItems: "center" }}>+</button>
              </div>
            </div>
            <div style={{ borderTop: "2px solid " + BDR, marginTop: 8, paddingTop: 8, display: "grid", gridTemplateColumns: "2fr 1fr 1.3fr 1fr 22px", gap: 4 }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: TXT }}>TOTAL</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: RED, textAlign: "right" }}>{fp(avgDebtRate, 1)}</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: TXT, textAlign: "right" }}>{fd(totalDebtBal)}</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: SUB, textAlign: "right" }}>{fd(totalDebtPmt)}</div>
              <div />
            </div>
          </div>
        </div>

        <div>
          <SubTabs tabs={[["compare", "Before vs After"], ["overview", "Overview"]]} active={view} onChange={setView} />
          {view === "compare" && (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, borderRadius: 14, overflow: "hidden", marginBottom: 14 }}>
                {[["BEFORE", currentTotal, REDL, RED], ["AFTER", consolidatedPmt, GRNL, GRN]].map(function(arr) {
                  var l = arr[0], v = arr[1], bg = arr[2], col = arr[3];
                  return (
                    <div key={l} style={{ background: bg, padding: "16px", textAlign: "center" }}>
                      <div style={{ fontSize: 9, fontWeight: 700, color: col, textTransform: "uppercase", letterSpacing: 1, marginBottom: 3 }}>{l}</div>
                      <div style={{ fontSize: 26, fontWeight: 800, color: col }}>{fd(v) + "/mo"}</div>
                    </div>
                  );
                })}
              </div>
              <Card>
                <div style={{ fontSize: 10, fontWeight: 700, color: MUT, textTransform: "uppercase", letterSpacing: 0.8, padding: "8px 0 4px" }}>Before: Individual Payments</div>
                {debts.map(function(d) {
                  return <Row key={d.id} label={d.label} value={fd(parseFloat(d.minPmt) || 0) + "/mo"} sub={d.rate + "% interest"} color={RED} />;
                })}
                <Row label={"Existing Mortgage @ " + fp(currentRate, 2)} value={fd(existingMortPmt) + "/mo"} color={MUT} />
                <Row label="Total Before" value={fd(currentTotal)} color={RED} bold={true} />
                <div style={{ borderTop: "1px dashed " + BDR, margin: "8px 0", paddingTop: 8 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: MUT, textTransform: "uppercase", letterSpacing: 0.8, paddingBottom: 4 }}>After: One Payment</div>
                  <Row label={"Consolidated at " + fp(newRate, 2)} value={fd(consolidatedPmt) + "/mo"} color={GRN} />
                  <Row label="Total After" value={fd(consolidatedPmt)} color={GRN} bold={true} large={true} last={true} />
                </div>
              </Card>
              <div style={{ background: savings > 0 ? NAVY : REDL, borderRadius: 14, padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 10, color: savings > 0 ? TEAL : RED, textTransform: "uppercase", letterSpacing: 1, fontWeight: 700 }}>Monthly Savings</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: savings > 0 ? "#fff" : RED }}>{fd(Math.abs(savings))}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 10, color: savings > 0 ? MUT : RED }}>Annually</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: savings > 0 ? GRN : RED }}>{fd(Math.abs(savings * 12))}</div>
                </div>
              </div>
            </div>
          )}
          {view === "overview" && (
            <div>
              <Card>
                <Row label="Current Mortgage Balance" value={fd(mortBal)} />
                <Row label="Total Debts to Consolidate" value={fd(totalDebtBal)} color={RED} />
                <Row label="New Mortgage (uncapped)" value={fd(rawNew)} />
                <Row label="80% LTV Cap" value={fd(maxLoan)} color={ltvExceeds ? RED : GRN} bold={true} />
                <Row label="Final Consolidated Mortgage" value={fd(finalPrincipal)} bold={true} large={true} last={true} />
              </Card>
              <div style={{ background: CARD, borderRadius: 14, padding: "14px 16px", border: "1px solid " + BDR }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: SUB, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 }}>Debt Breakdown</div>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <ResponsiveContainer width={100} height={100}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={22} outerRadius={44} dataKey="value" strokeWidth={0}>
                        {pieData.map(function(d, i) { return <Cell key={i} fill={d.color} />; })}
                      </Pie>
                      <Tooltip content={<PieTip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ flex: 1 }}>
                    {pieData.map(function(d, i) {
                      return (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "3px 0", borderBottom: "1px solid " + BG }}>
                          <span style={{ color: SUB }}><span style={{ color: d.color }}>● </span>{d.name}</span>
                          <span style={{ fontWeight: 700, color: TXT }}>{fd(d.value)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// TAB 4 — REFINANCE / RENEWAL
// ══════════════════════════════════════════════════════════════
function RefinanceSection() {
  var balS   = useState(450000);  var bal    = balS[0],    setBal    = balS[1];
  var curRS  = useState(5.74);    var curR   = curRS[0],   setCurR   = curRS[1];
  var newRS  = useState(LR.variable5); var newR = newRS[0], setNewR  = newRS[1];
  var amS    = useState(20);      var remAm  = amS[0],     setRemAm  = amS[1];
  var penS   = useState(false);   var showPen= penS[0],    setShowPen= penS[1];
  var pAmtS  = useState(8500);    var pen    = pAmtS[0],   setPen    = pAmtS[1];

  var curPmt = calcPmt(bal, curR, remAm, "monthly");
  var nwPmt  = calcPmt(bal, newR, remAm, "monthly");
  var sav    = curPmt - nwPmt;
  var be     = sav > 0 && showPen ? Math.ceil(pen / sav) : null;
  var cSched = buildSched(bal, curR, remAm);
  var nSched = buildSched(bal, newR, remAm);
  var cInt   = cSched.reduce(function(s, d) { return s + d.interest; }, 0);
  var nInt   = nSched.reduce(function(s, d) { return s + d.interest; }, 0);
  var chartD = cSched.map(function(d, i) {
    return {
      year: d.year,
      Current: Math.round(cSched.slice(0, i + 1).reduce(function(s, dd) { return s + dd.interest; }, 0)),
      Refinanced: Math.round(nSched.slice(0, i + 1).reduce(function(s, dd) { return s + dd.interest; }, 0))
    };
  });
  var savMsg = sav > 0
    ? fd(sav) + "/month saved · " + fd(cInt - nInt - (showPen ? pen : 0)) + " lifetime interest saved"
    : "New rate is higher — no benefit to breaking early.";

  return (
    <div>
      <RatesBanner onSelect={setNewR} hideBLender={true} />
      <div className="two-col">
        <div>
          <CurrencyInput label="Current Mortgage Balance" value={bal} onChange={setBal} />
          <div style={S.g2}>
            <NumInput label="Current Rate" value={curR} onChange={setCurR} suf="%" min={0.5} max={25} />
            <NumInput label="New Rate" value={newR} onChange={setNewR} suf="%" min={0.5} max={25} />
          </div>
          <NumInput label="Remaining Amortization" value={remAm} onChange={setRemAm} suf="yrs" min={1} max={30} />
          <div style={{ background: BG, borderRadius: 12, padding: "4px 14px 10px", marginBottom: 14, border: "1px solid " + BDR }}>
            <Toggle label="Show Break Penalty Analysis" value={showPen} onChange={setShowPen} />
            {showPen && (
              <div style={{ paddingTop: 6 }}>
                <CurrencyInput label="Break Penalty Amount" value={pen} onChange={setPen} hint="3-month interest or IRD — ask your lender" small={true} />
                {be && <Alert type="info">{"Break-even in " + be + " months (" + (be / 12).toFixed(1) + " yrs)"}</Alert>}
              </div>
            )}
          </div>
          <Alert type={sav > 0 ? "ok" : "warn"}>{savMsg}</Alert>
        </div>
        <div>
          <div style={{ background: NAVY, borderRadius: 18, padding: "18px", marginBottom: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
              {[["Current", curPmt, "rgba(255,255,255,0.35)"], ["New", nwPmt, TEAL]].map(function(arr) {
                var l = arr[0], v = arr[1], col = arr[2];
                return (
                  <div key={l} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 10, color: col, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 3 }}>{l + " Payment"}</div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: "#fff" }}>{fd(v)}<span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>/mo</span></div>
                  </div>
                );
              })}
            </div>
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 14, textAlign: "center" }}>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 }}>Lifetime Interest Saved</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: sav > 0 ? GRN : RED }}>{sav > 0 ? fd(cInt - nInt) : "—"}</div>
            </div>
          </div>
          <Card mb={14}>
            <Row label="Monthly Savings" value={fd(Math.abs(sav))} color={sav > 0 ? GRN : RED} />
            {showPen && <Row label="Break Penalty" value={fd(pen)} color={RED} />}
            {showPen && be && <Row label="Break-Even" value={be + " months"} bold={true} />}
            <Row label="Net Interest Saved" value={sav > 0 ? fd(cInt - nInt - (showPen ? pen : 0)) : "—"} bold={true} large={true} last={true} />
          </Card>
          <div style={{ background: BG, borderRadius: 14, padding: 14, border: "1px solid " + BDR }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: MUT, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 }}>Cumulative Interest</div>
            <ResponsiveContainer width="100%" height={130}>
              <AreaChart data={chartD} margin={{ top: 2, right: 4, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={BDR} />
                <XAxis dataKey="year" tick={{ fontSize: 10, fill: MUT }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: MUT }} tickLine={false} axisLine={false} tickFormatter={function(v) { return "$" + Math.round(v / 1000) + "k"; }} />
                <Tooltip content={<ChTip />} />
                <Area type="monotone" dataKey="Current" stroke={MUT} fill={MUT + "20"} strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="Refinanced" stroke={TEAL} fill={TEAL + "20"} strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function RenewalSection() {
  var balS  = useState(380000);  var bal   = balS[0],   setBal   = balS[1];
  var curRS = useState(5.74);    var curR  = curRS[0],  setCurR  = curRS[1];
  var newRS = useState(LR.variable5); var newR = newRS[0], setNewR = newRS[1];
  var amS   = useState(20);      var remAm = amS[0],    setRemAm = amS[1];
  var termS = useState(5);       var term  = termS[0],  setTerm  = termS[1];

  var curPmt    = calcPmt(bal, curR, remAm, "monthly");
  var nwPmt     = calcPmt(bal, newR, remAm, "monthly");
  var diff      = curPmt - nwPmt;
  var curSched  = buildSched(bal, curR, remAm);
  var newSched  = buildSched(bal, newR, remAm);
  var curTermInt= curSched.slice(0, term).reduce(function(s, d) { return s + d.interest; }, 0);
  var newTermInt= newSched.slice(0, term).reduce(function(s, d) { return s + d.interest; }, 0);
  var newBal    = newSched[term - 1] ? newSched[term - 1].balance : 0;
  var sr        = Math.max(newR + 2, LR.stressFloor);
  var alertMsg  = diff > 0
    ? "Save " + fd(diff) + "/month. Don't auto-renew — call Miracle Financial at 905-588-4242."
    : "New rate is " + fd(Math.abs(diff)) + "/mo higher. Consider a shorter term or variable rate.";

  return (
    <div>
      <RatesBanner onSelect={setNewR} hideBLender={true} />
      <div className="two-col">
        <div>
          <CurrencyInput label="Balance at Renewal" value={bal} onChange={setBal} hint="Outstanding balance when your term expires" />
          <div style={S.g2}>
            <NumInput label="Expiring Rate" value={curR} onChange={setCurR} suf="%" min={0.5} max={25} />
            <NumInput label="New Offered Rate" value={newR} onChange={setNewR} suf="%" min={0.5} max={25} />
          </div>
          <div style={S.g2}>
            <NumInput label="Remaining Amortization" value={remAm} onChange={setRemAm} suf="yrs" min={1} max={30} />
            <NumInput label="New Term" value={term} onChange={setTerm} suf="yrs" min={1} max={10} />
          </div>
          <Alert type="info">{"Switching lenders requires stress test at " + fp(sr, 2) + ". Same lender renewal typically does not."}</Alert>
        </div>
        <div>
          <div style={{ background: NAVY, borderRadius: 18, padding: "18px", marginBottom: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
              {[["Expiring " + fp(curR, 2), curPmt, "rgba(255,255,255,0.35)"], ["New " + fp(newR, 2), nwPmt, TEAL]].map(function(arr) {
                var l = arr[0], v = arr[1], col = arr[2];
                return (
                  <div key={l} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 10, color: col, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 2 }}>{l}</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>{fd(v)}<span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>/mo</span></div>
                  </div>
                );
              })}
            </div>
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 2 }}>Monthly Change</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: diff > 0 ? GRN : RED }}>{(diff > 0 ? "-" : "+") + fd(Math.abs(diff)) + "/mo"}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 2 }}>{term + "-yr term"}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: diff > 0 ? GRN : RED }}>{(diff > 0 ? "Save " : "Pay ") + fd(Math.abs(diff * 12 * term))}</div>
              </div>
            </div>
          </div>
          <Card>
            <Row label={term + "-Year Interest (expiring)"} value={fd(curTermInt)} color={RED} />
            <Row label={term + "-Year Interest (new rate)"} value={fd(newTermInt)} color={GRN} />
            <Row label="Interest Saved This Term" value={fd(Math.abs(curTermInt - newTermInt))} color={TEAL} bold={true} />
            <Row label="Balance After Term" value={fd(newBal)} bold={true} large={true} last={true} />
          </Card>
          <Alert type={diff > 0 ? "ok" : "warn"}>{alertMsg}</Alert>
        </div>
      </div>
    </div>
  );
}

function RefiRenewalTab() {
  var subS = useState("refinance");
  var sub = subS[0], setSub = subS[1];
  return (
    <div>
      <SubTabs tabs={[["refinance", "Refinance"], ["renewal", "Renewal"]]} active={sub} onChange={setSub} />
      {sub === "refinance" ? <RefinanceSection /> : <RenewalSection />}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// TAB 5 — CLOSING COSTS
// ══════════════════════════════════════════════════════════════
function ClosingCostsTab() {
  var prS  = useState(750000);  var price    = prS[0],   setPrice    = prS[1];
  var pvS  = useState("ON");    var prov     = pvS[0],   setProv     = pvS[1];
  var ftS  = useState(false);   var ft       = ftS[0],   setFt       = ftS[1];
  var toS  = useState(false);   var toronto  = toS[0],   setToronto  = toS[1];
  var lgS  = useState(1800);    var legalFees= lgS[0],   setLegalFees= lgS[1];
  var inS  = useState(500);     var inspect  = inS[0],   setInspect  = inS[1];
  var mvS  = useState(2000);    var moving   = mvS[0],   setMoving   = mvS[1];
  var tiS  = useState(350);     var titleIns = tiS[0],   setTitleIns = tiS[1];
  var apS  = useState(500);     var apprais  = apS[0],   setApprais  = apS[1];
  var otS  = useState(0);       var other    = otS[0],   setOther    = otS[1];

  var pTax = lttCalc(price, prov, ft);
  var toTax = 0;
  if (toronto && prov === "ON") {
    if (price <= 55000) toTax = price * 0.005;
    else if (price <= 250000) toTax = 275 + (price - 55000) * 0.01;
    else if (price <= 400000) toTax = 2225 + (price - 250000) * 0.015;
    else if (price <= 2000000) toTax = 4475 + (price - 400000) * 0.02;
    else toTax = 36475 + (price - 2000000) * 0.025;
    if (ft) toTax = Math.max(0, toTax - 4475);
    toTax = Math.round(toTax);
  }
  var totalLTT  = pTax + toTax;
  var others    = legalFees + inspect + titleIns + apprais + moving + other;
  var total     = totalLTT + others;
  var breakdown = [
    { name: "Land Transfer Tax", value: totalLTT, color: TEAL },
    { name: "Legal Fees",        value: legalFees, color: AMB },
    { name: "Title Insurance",   value: titleIns,  color: "#8B5CF6" },
    { name: "Inspection",        value: inspect,   color: GRN },
    { name: "Moving",            value: moving,    color: "#06B6D4" },
    { name: "Appraisal",         value: apprais,   color: "#F97316" },
    { name: "Other",             value: other,     color: MUT },
  ].filter(function(d) { return d.value > 0; });

  return (
    <div className="two-col">
      <div>
        <CurrencyInput label="Purchase Price" value={price} onChange={setPrice} />
        <SelInput label="Province" value={prov} onChange={setProv} opts={[
          { v: "ON", l: "Ontario" }, { v: "BC", l: "British Columbia" },
          { v: "AB", l: "Alberta (No LTT)" }, { v: "QC", l: "Quebec" },
          { v: "MB", l: "Manitoba" }, { v: "NS", l: "Nova Scotia" }
        ]} />
        <div style={{ background: BG, borderRadius: 12, padding: "4px 14px 10px", marginBottom: 14, border: "1px solid " + BDR }}>
          <Toggle label="First-time home buyer rebate" value={ft} onChange={setFt} />
          {prov === "ON" && <Toggle label="Purchasing in Toronto (municipal LTT)" value={toronto} onChange={setToronto} />}
        </div>
        <div style={{ background: CARD, borderRadius: 14, padding: "14px 16px", border: "1px solid " + BDR }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: SUB, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 12 }}>Other Closing Costs</div>
          <CurrencyInput label="Legal Fees"      value={legalFees} onChange={setLegalFees} small={true} />
          <CurrencyInput label="Home Inspection"  value={inspect}   onChange={setInspect}   small={true} />
          <CurrencyInput label="Title Insurance"  value={titleIns}  onChange={setTitleIns}  small={true} />
          <CurrencyInput label="Appraisal Fee"    value={apprais}   onChange={setApprais}   small={true} />
          <CurrencyInput label="Moving Costs"     value={moving}    onChange={setMoving}    small={true} />
          <CurrencyInput label="Other"            value={other}     onChange={setOther}     small={true} />
        </div>
      </div>
      <div>
        <HeroPill label="Total Closing Costs" value={fd(total)} sub={fp(total / price * 100) + " of purchase price"} />
        <Card>
          <Row label="Provincial Land Transfer Tax" value={fd(pTax)} />
          {ft && pTax < lttCalc(price, prov, false) && <Row label="First-Time Buyer Rebate" value={"−" + fd(lttCalc(price, prov, false) - pTax)} color={GRN} sub="Applied above" />}
          {toronto && prov === "ON" && <Row label="Toronto Municipal LTT" value={fd(toTax)} color={RED} />}
          <Row label="Total Land Transfer Tax" value={fd(totalLTT)} bold={true} />
          <Row label="Other Closing Costs" value={fd(others)} />
          <Row label="Total Closing Costs" value={fd(total)} color={TEAL} bold={true} large={true} last={true} />
        </Card>
        <div style={{ background: CARD, borderRadius: 14, padding: "14px 16px", border: "1px solid " + BDR }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: SUB, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 }}>Breakdown</div>
          <ResponsiveContainer width="100%" height={100}>
            <PieChart>
              <Pie data={breakdown} cx="50%" cy="50%" outerRadius={46} dataKey="value" strokeWidth={0}>
                {breakdown.map(function(d, i) { return <Cell key={i} fill={d.color} />; })}
              </Pie>
              <Tooltip content={<PieTip />} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 12px", marginTop: 8 }}>
            {breakdown.map(function(d) {
              return <span key={d.name} style={{ fontSize: 10, color: SUB }}><span style={{ color: d.color }}>● </span>{d.name}</span>;
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// APP SHELL
// ══════════════════════════════════════════════════════════════
// ─── Custom SVG Icons ─────────────────────────────────────────
function IconPurchase(props) {
  var sz = props.size || 18;
  return (
    <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/>
      <path d="M9 21V12h6v9"/>
      <circle cx="18" cy="6" r="3" fill="currentColor" stroke="none"/>
      <path d="M17 6h2M18 5v2" stroke="#fff" strokeWidth="1.5"/>
    </svg>
  );
}
function IconAffordability(props) {
  var sz = props.size || 18;
  return (
    <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9a2 2 0 012-2h14a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
      <path d="M8 7V5a2 2 0 014 0v2"/>
      <circle cx="12" cy="13" r="2"/>
      <path d="M12 11v-1M12 16v-1"/>
    </svg>
  );
}
function IconDebt(props) {
  var sz = props.size || 18;
  return (
    <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2"/>
      <path d="M2 10h20"/>
      <path d="M6 15h4M14 15h4"/>
      <path d="M8 7.5V5M16 7.5V5"/>
    </svg>
  );
}
function IconRefinance(props) {
  var sz = props.size || 18;
  return (
    <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/>
      <path d="M9 21V14h6v7"/>
      <path d="M16 8a4 4 0 010 5.66" strokeDasharray="2 1.5"/>
      <path d="M18.5 5.5l-1 2.5 2.5-1"/>
    </svg>
  );
}
function IconClosing(props) {
  var sz = props.size || 18;
  return (
    <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
      <path d="M14 2v6h6"/>
      <path d="M8 13h8M8 17h5"/>
      <path d="M15 13l1.5 1.5L19 12"/>
    </svg>
  );
}

var TABS = [
  { id: "purchase", Icon: IconPurchase,      label: "Purchase",            shortLabel: "Purchase" },
  { id: "afford",   Icon: IconAffordability, label: "Affordability",       shortLabel: "Afford" },
  { id: "debt",     Icon: IconDebt,          label: "Debt Consolidation",  shortLabel: "Debt Consol." },
  { id: "existing", Icon: IconRefinance,     label: "Refinance / Renewal", shortLabel: "Refi / Renew" },
  { id: "closing",  Icon: IconClosing,       label: "Closing Costs",       shortLabel: "Closing" },
];

export default function App() {
  var tabS = useState("purchase");
  var tab = tabS[0], setTab = tabS[1];
  var cur = TABS.find(function(t) { return t.id === tab; });

  function renderTab() {
    if (tab === "purchase")  return <PurchaseTab />;
    if (tab === "afford")    return <AffordabilityTab />;
    if (tab === "debt")      return <DebtConsolidationTab />;
    if (tab === "existing")  return <RefiRenewalTab />;
    return <ClosingCostsTab />;
  }

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif", color: TXT, paddingBottom: 64 }}>
      <style>{"* { box-sizing: border-box; margin: 0; padding: 0; } input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; } select { cursor: pointer; } .two-col { display: grid; grid-template-columns: 340px 1fr; gap: 24px; } @media(max-width:768px) { .two-col { grid-template-columns: 1fr !important; gap: 16px !important; } .hide-mobile { display: none !important; } } .tab-bar::-webkit-scrollbar { display: none; } .tab-bar { -ms-overflow-style: none; scrollbar-width: none; }"}</style>


      <div style={{ position: "sticky", top: 0, zIndex: 100, background: NAVY, boxShadow: "0 2px 20px rgba(15,30,46,0.4)" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 16px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 72 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <a href="https://miraclefinancial.ca" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
              <img src={LOGO_B64} alt="Miracle Financial" style={{ height: 56, width: "auto", display: "block" }}/>
            </a>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <a href="tel:9055884242" className="hide-mobile" style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.1)", color: "#fff", padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, textDecoration: "none" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
              </svg>
              905-588-4242
            </a>
            <a href="https://miracle-financial.mtg-app.com/signup" target="_blank" rel="noreferrer"
              style={{ background: "#FF6B1A", color: "#fff", padding: "8px 16px", borderRadius: 8, fontSize: 12, fontWeight: 800, textDecoration: "none", boxShadow: "0 4px 14px rgba(255,107,26,0.5)", whiteSpace: "nowrap" }}>
              Get Pre-Approved →
            </a>
          </div>
        </div>
      </div>

      <div style={{ background: "#fff", borderBottom: "2px solid " + BDR, position: "sticky", top: 72, zIndex: 90 }}>
        {(function() {
          var ROW1 = TABS.slice(0, 3);
          var ROW2 = TABS.slice(3);
          function TabBtn(t) {
            var active = tab === t.id;
            return (
              <button key={t.id} onClick={function() { setTab(t.id); }}
                style={{ flex: 1, padding: "11px 6px", border: "none", background: "none", cursor: "pointer",
                  fontWeight: active ? 800 : 600, fontSize: 12, color: active ? TEAL : "#64748b",
                  borderBottom: "3px solid " + (active ? TEAL : "transparent"), background: active ? "rgba(0,180,204,0.06)" : "none",
                  transition: "all 0.15s", display: "flex", alignItems: "center", justifyContent: "center",
                  gap: 5, whiteSpace: "nowrap" }}>
                <t.Icon size={14} />
                {t.label}
              </button>
            );
          }
          return (
            <div style={{ maxWidth: 1000, margin: "0 auto" }}>
              <div style={{ display: "flex", borderBottom: "1px solid " + BDR }}>
                {ROW1.map(TabBtn)}
              </div>
              <div style={{ display: "flex" }}>
                {ROW2.map(function(t) {
                  var active = tab === t.id;
                  return (
                    <button key={t.id} onClick={function() { setTab(t.id); }}
                      style={{ flex: 1, padding: "11px 6px", border: "none", background: "none", cursor: "pointer",
                        fontWeight: active ? 800 : 600, fontSize: 12, color: active ? TEAL : "#64748b",
                        borderBottom: "3px solid " + (active ? TEAL : "transparent"), background: active ? "rgba(0,180,204,0.06)" : "none",
                        transition: "all 0.15s", display: "flex", alignItems: "center", justifyContent: "center",
                        gap: 5, whiteSpace: "nowrap" }}>
                      <t.Icon size={14} />
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })()}
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "20px 16px", minHeight: "calc(100vh - 130px)" }}>
        <div style={{ background: CARD, borderRadius: 20, padding: "22px 22px 28px", boxShadow: "0 1px 3px rgba(0,0,0,0.03),0 4px 16px rgba(0,0,0,0.05)", marginBottom: 14 }}>
          <div style={{ marginBottom: 18, paddingBottom: 14, borderBottom: "1px solid " + BG }}>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: TXT, letterSpacing: -0.4, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: TEAL }}><cur.Icon size={20} /></span>
              {cur.label}
            </h2>
          </div>
          {renderTab()}
        </div>
        <div style={{ background: NAVY, borderRadius: 16, overflow: "hidden", marginTop: 10 }}>
          <div style={{ padding: "20px 24px", display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 900, color: "#fff", letterSpacing: -0.5 }}>Miracle Financial</div>
              <div style={{ fontSize: 10, color: TEAL, letterSpacing: 1.5, textTransform: "uppercase", marginTop: 3 }}>Turning Dreams Into Miracles</div>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {[
                ["🏛", "Licensed Broker · FSRA # 13766"],
                ["👥", "1000+ Clients Helped"],
                ["⭐", "5-Star Google Reviews"],
                ["📍", "Vaughan, ON & Across Canada"],
              ].map(function(b) {
                return (
                  <div key={b[1]} style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.07)", borderRadius: 8, padding: "6px 12px" }}>
                    <span style={{ fontSize: 14 }}>{b[0]}</span>
                    <span style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.8)" }}>{b[1]}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", padding: "10px 24px", textAlign: "center" }}>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{"© " + new Date().getFullYear() + " Miracle Financial. All rights reserved. · 603 Millway Ave Unit 17, Vaughan, ON"}</span>
          </div>
        </div>            
      </div>

      <DisclaimerFooter />
    </div>
  );
}
