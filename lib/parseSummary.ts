// lib/parseSummary.ts

export interface TestResult {
    name: string;
    nickname: string | null;
    icon: string;
    importance: string;
    result: string;
    status: 'low' | 'normal' | 'high';
    explanation: string;
    tip: string;
    verdict: string;
    referenceRange?: string; // New!
}

export interface ParsedSummary {
    tests: TestResult[];
    finalTip: string;
}

export function parseAISummary(summaryText: string): ParsedSummary {
    const tests: TestResult[] = [];
    let finalTip: string = "";

    // Split by test sections (starts with ## 🧪)
    const testSections = summaryText.split(/#{2}\s+🧪\s+\*\*Test\*\*:/i).filter(Boolean);

    // Extract final tip separately (starts with 👉)
    const finalTipMatch = summaryText.match(/👉\s+"([^"]+)"/);
    if (finalTipMatch) {
        finalTip = finalTipMatch[1];
    }

    // Process each test section
    testSections.forEach(section => {
        // Basic structure to populate
        const test: TestResult = {
            name: "",
            nickname: null,
            icon: "🧪", // Default icon
            importance: "",
            result: "",
            status: "normal", // Default status
            explanation: "",
            tip: "",
            verdict: ""
        };

        // Extract test name and nickname
        const nameMatch = section.match(/^([^(]+)(?:\(aka\s+"([^"]+)"\))?/);
        if (nameMatch) {
            test.name = nameMatch[1].trim();
            test.nickname = nameMatch[2] ? nameMatch[2].trim() : null;
        }

        // Extract importance (Why this test matters)
        const importanceMatch = section.match(/🧠\s+\*\*Why this slaps\*\*:\s+([^\n]+)/);
        if (importanceMatch) {
            test.importance = importanceMatch[1].trim();
        }


        // Extract results
        const resultsMatch = section.match(/📊\s+\*\*Results\*\*:\s+([^—\n]+)(?:—\s+([^\n]+))?/);
        if (resultsMatch) {
            test.result = resultsMatch[1]?.trim() || "Not specified";
            test.explanation = resultsMatch[2]?.trim() || "";

            // Determine status based on result text or explicit markers
            if (section.toLowerCase().includes("(low)") || test.result.toLowerCase().includes("low") || test.result.toLowerCase().includes(" slightly low")) {
                test.status = "low";
            } else if (section.toLowerCase().includes("(high)") || test.result.toLowerCase().includes("high") || test.result.toLowerCase().includes("slightly high")) {
                test.status = "high";
            } else {
                test.status = "normal";
            }
        } else {
            // Fallback if no specific result is found
            test.result = "No reading available";

            // Try to still determine status from keywords
            if (section.toLowerCase().includes("low")) {
                test.status = "low";
            } else if (section.toLowerCase().includes("high")) {
                test.status = "high";
            } else {
                test.status = "normal";
            }
        }


        // Extract tiny tip
        const tipMatch = section.match(/🩺\s+\*\*Tiny Tip\*\*:\s+([^\n]+)/);
        if (tipMatch) {
            test.tip = tipMatch[1].trim();
        }

        // Extract verdict
        const verdictMatch = section.match(/🎯\s+\*\*Final Vibe Check\*\*:\s+([^\n]+)/);
        if (verdictMatch) {
            test.verdict = verdictMatch[1].trim();
        }

        tests.push(test);
    });

    return { tests, finalTip };
}


export function parseGenZSummary(summaryText: string): ParsedSummary {
    const tests: TestResult[] = [];
    let finalTip = "";

    // Extract final tip (👉 **"some tip"**)
    const finalTipMatch = summaryText.match(/👉\s+\*\*"([^"]+)"\*\*/);
    if (finalTipMatch) {
        finalTip = finalTipMatch[1].trim();
    }

    // Split all test sections
    const testSections = summaryText.split(/##\s+🧪\s+\*\*Test\*\*:\s*/i).filter(Boolean);

    testSections.forEach(section => {
        const test: TestResult = {
            name: "",
            nickname: null,
            icon: "🧪",
            importance: "",
            result: "",
            status: "normal",
            explanation: "",
            tip: "",
            verdict: ""
        };

        // Match name and nickname
        const nameMatch = section.match(/\*\*(.*?)\*\*/);
        if (nameMatch) {
            // Extract name and nickname if present in parentheses
            const nameWithNickname = nameMatch[1].trim();
            const parenMatch = nameWithNickname.match(/^([^(]+)\s*\(([^)]+)\)/);
            if (parenMatch) {
                test.name = parenMatch[1].trim();
                test.nickname = parenMatch[2].trim();
            } else {
                test.name = nameWithNickname;
                test.nickname = null;
            }
        }

        // Importance section
        const importanceMatch = section.match(/🧠\s+\*\*Why this test matters\*\*:\s+([\s\S]*?)\n\n|📊/);
        if (importanceMatch) {
            test.importance = importanceMatch[1]?.trim() || "";
        }

        // Results
        const resultMatch = section.match(/📊\s+\*\*Results\*\*:\s+([^\n(]+)\s*\(([^)]+)\)\s*—?\s*(.*)/);
        if (resultMatch) {
            const valuePart = resultMatch[1].trim();
            const statusMarker = resultMatch[2].toLowerCase();
            const explanationPart = resultMatch[3].trim();

            test.result = valuePart;
            test.explanation = explanationPart;

            if (statusMarker.includes("low")) {
                test.status = "low";
            } else if (statusMarker.includes("high")) {
                test.status = "high";
            } else {
                test.status = "normal";
            }
        }

        // Tiny Tip
        const tipMatch = section.match(/🩺\s+\*\*Tiny Tip\*\*:\s+([^\n]+)/);
        if (tipMatch) {
            test.tip = tipMatch[1].trim();
        }

        // Verdict
        const verdictMatch = section.match(/🎯\s+\*\*Verdict & Vibes\*\*:\s+([^\n]+)/);
        if (verdictMatch) {
            test.verdict = verdictMatch[1].trim();
        }

        tests.push(test);
    });

    return { tests, finalTip };
}
