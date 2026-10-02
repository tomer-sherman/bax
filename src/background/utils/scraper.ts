import * as cheerio from "cheerio";
import type { Element as CheerioElement } from "domhandler";

import type { MetaDataModel } from "../models/meta-data-model";


class Scraper {

    private readonly readExclude = [
        // Non-content (script was missing — that's where the JSON blobs came from)
        "script", "noscript", "template", "style", "svg",
        "iframe", "canvas", "video", "audio", "object", "embed", "dialog",

        // Hidden elements + Plasmo dev widget
        "[hidden]", '[aria-hidden="true"]', '[id^="__plasmo"]', "plasmo-csui",

        // Page layout
        "nav", "footer", "aside",
        "body > header",

        // ARIA layout roles
        '[role="navigation"]', '[role="banner"]', '[role="contentinfo"]',
        '[role="complementary"]', '[role="dialog"]', '[role="search"]',

        // Forms and controls
        "form", "button", "input", "select", "textarea", "label",

        // Junk by class/id
        '[id*="cookie"]', '[id*="advert"]', '[class*="sponsor"]', '[class*="promo"]',
        '[class*="popup"]', '[class*="modal"]',
        '[class*="newsletter"]', '[class*="subscribe"]',
        '[class*="share"]', '[class*="social"]',
        '[class*="related"]', '[class*="recommend"]',
        '[class*="breadcrumb"]', '[class*="sidebar"]',
        '[class*="comment"]',
    ];

    // Where the real content usually lives — best guess first
    private readonly contentRoots = ["article", "main", '[role="main"]', "body"];

    // Every element matching this becomes exactly one line
    private readonly lineSelector = "h1, h2, h3, h4, h5, h6, p, li, tr, pre, blockquote, figcaption, dt, dd, img[alt]";

    public getHtml(): string {
        const html = document.documentElement.outerHTML;
        return html;
    }

    public getAllHeaders(html: string): string[] {

        const $ = cheerio.load(html);

        const headers = $(":header").map((_, el) => $(el).text().trim()).get();

        console.log(headers);
        return headers;

    }

    public getMetaData(html: string): MetaDataModel {
        const $ = cheerio.load(html);
        const metaData = {
            title: $("title").text().trim(),
            description: $('meta[name="description"]').attr("content"),
            published: $('meta[property="article:published_time"]').attr("content"),
            author: $('meta[name="author"]').attr("content"),
            canonical: $('link[rel="canonical"]').attr("href"),
        }

        console.log(metaData);

        return metaData;
    }

    // The page as markdown-style lines, in page order — headings keep their level,
    // lists, tables and quotes keep their shape
    public getPageMarkdown(html: string): string[] {
        const $ = cheerio.load(html);
        $(this.readExclude.join(", ")).remove();

        const rootSelector = this.contentRoots.find((selector) => $(selector).length > 0) ?? "body";
        const root = $(rootSelector).first();

        const lines: string[] = [];

        root.find(`${this.lineSelector}, div`).each((_, el) => {
            const $el = $(el);

            // Already part of a parent line (p inside li, p inside blockquote...)
            if ($el.parents(this.lineSelector).length > 0) return;

            // Only take divs that hold plain text, not divs that wrap other blocks
            if (el.tagName === "div" && $el.find(`${this.lineSelector}, div`).length > 0) return;

            const line = this.toLine($, el);
            if (line) lines.push(line);
        });


        return lines
    }

    // Skim tool — every line numbered, long lines cut short
    public getSkimView(lines: string[], maxLength = 80): string {
        const skimer = lines
            .map((line, index) => {
                const shortLine = line.length > maxLength ? `${line.slice(0, maxLength)}…` : line;
                return `${index + 1}: ${shortLine}`;
            })
            .join("\n");



        return skimer;
    }

    // Read tool — full lines from `from` to `to` (1-based, inclusive)
    public getLineRange(lines: string[], from: number, to: number): string {
        const start = Math.max(from, 1);

        const selectedLines = lines
            .slice(start - 1, to)
            .map((line, index) => `${start + index}: ${line}`)
            .join("\n");



        return selectedLines;
    }

    // Private shit.

    private toLine($: cheerio.CheerioAPI, el: CheerioElement): string {
        const $el = $(el);
        const tag = el.tagName;

        if (tag === "img") {
            const alt = this.cleanText($el.attr("alt") ?? "");
            return alt ? `[Image: ${alt}]` : "";
        }

        const text = this.cleanText($el.text());
        if (!text) return "";

        if (/^h[1-6]$/.test(tag)) return `${"#".repeat(Number(tag[1]))} ${text}`;

        switch (tag) {
            case "li": return `- ${text}`;
            case "blockquote": return `> ${text}`;
            case "pre": return `[Code] ${text}`;
            case "tr": {
                const cells = $el.children("th, td").map((_, cell) => this.cleanText($(cell).text())).get();
                return `| ${cells.join(" | ")} |`;
            }
            default: return text;
        }
    }

    private cleanText(text: string): string {
        return text.replace(/\s+/g, " ").trim();
    }

}

export const scraper = new Scraper();