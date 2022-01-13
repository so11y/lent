import cheerio from "cheerio";
import { LentPlugin } from "./preCompose"

export const indexHtmlAddClientPlugin = ():LentPlugin => {
    return (l) => {
        l.plugin.addPlugins({
            name: "indexHtmlAddClientPlugin",
            transform(v) {
                const $ = cheerio.load(v);
                $("head").append(`<script type='module' src='./client' />`)
                return $.html();
            }
        })
    }
}