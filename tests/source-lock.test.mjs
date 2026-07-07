import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const contentJs = readFileSync(new URL("../src/content.js", import.meta.url), "utf8");

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

test("Vietnamese source strings remain unedited", () => {
  [
    "GIÁ TRỊ VƯỢT THỜI GIAN",
    "LỜI TRI ÂN",
    "NHỮNG CON SỐ ẤN TƯỢNG",
    "30 NĂM VỮNG MỘT TÔN CHỈ",
    "NHỮNG CỘT MỐC ĐÁNG NHỚ",
    "VỀ HINO MOTORS VIỆT NAM",
    "CÔNG TY LIÊN DOANH TNHH HINO MOTORS VIỆT NAM"
  ].forEach((text) => assert.match(contentJs, new RegExp(escapeRegExp(text))));
});

test("English source strings remain unedited", () => {
  [
    "TIMELESS VALUE",
    "APPRECIATION LETTER",
    "OUTSTANDING STATISTICS",
    "30 YEARS, ONE GUIDING PRINCIPLE",
    "MEMORABLE MILESTONES",
    "ABOUT HINO MOTORS VIETNAM",
    "HINO MOTORS VIETNAM, LTD."
  ].forEach((text) => assert.match(contentJs, new RegExp(escapeRegExp(text))));
});
