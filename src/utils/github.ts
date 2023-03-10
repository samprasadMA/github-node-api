import { QueryBuilder } from "./querybuilder";
import got from "got";
import { GITHUB_API_URL, GITHUB_WEB } from "./constants";
import { noOpenPRsFound } from "./errors";

export const ghRequest = got.extend({
    prefixUrl: GITHUB_API_URL,
    headers: {
        accept: "application/vnd.github.v3+json",
        token: process.env.GITHUB_TOKEN,
    },
});

export function ListPullRequests(
    repo: string,
    per_page: number,
    page: number
): Promise<any> {
    const options = {
        searchParams: {
            q: QueryBuilder({ repo, type: "pr", state: "open" }),
            page,
            per_page,
        },
    };
    try {
        return ghRequest("search/issues", options).json();
    } catch (err) {
        return Promise.reject(noOpenPRsFound);
    }
}

export function GetPullRequest(repo: string, pr_number: number): Promise<any> {
    try {
        const url = `repos/${repo}/pulls/${pr_number}`;
        return ghRequest(url).json();
    } catch (err) {
        return Promise.reject(noOpenPRsFound);
    }
}

export default function parseRepoUrl(url: string): string {
    if (typeof url !== "string" || url.length === 0)
        throw new Error("type error");

    const parsedUrl = new URL(url, GITHUB_WEB);
    const tokenizedPath = parsedUrl.pathname.split("/");
    if (tokenizedPath.length < 2) {
        throw new Error(noOpenPRsFound);
    }

    const owner = tokenizedPath[tokenizedPath.length - 2].trim();
    const repo = tokenizedPath[tokenizedPath.length - 1].trim();

    if (owner.length === 0 || repo.length === 0) {
        throw new Error(noOpenPRsFound);
    }

    return `${owner}/${repo}`;
}

