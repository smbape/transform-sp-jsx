const OPT_NAME = "@sp-jsx";
const INLINE_OPTS_TREG = new RegExp(/\*?\s*/.source + OPT_NAME + /(?:\s+|$)/.source);
const INLINE_OPTS_REG = new RegExp(/\*?\s*/.source + OPT_NAME + /\s+([^\r\n]+)/.source);

export default function _getOpts(path, state) {
    const opts = Object.assign({
        events: [
            "spBlur",
            "spChange",
            "spClick",
            "spDrag",
            "spDrop",
            "spFocus",
            "spInput",
            "spLoad",
            "spMouseenter",
            "spMouseleave",
            "spMousemove",
            "spPropertychange",
            "spReset",
            "spScroll",
            "spSubmit",
            "spAbort",
            "spCanplay",
            "spCanplaythrough",
            "spDurationchange",
            "spEmptied",
            "spEncrypted",
            "spEnded",
            "spError",
            "spLoadeddata",
            "spLoadedmetadata",
            "spLoadstart",
            "spPause",
            "spPlay",
            "spPlaying",
            "spProgress",
            "spRatechange",
            "spSeeked",
            "spSeeking",
            "spStalled",
            "spSuspend",
            "spTimeupdate",
            "spVolumechange",
            "spWaiting"
        ],
        repeat: "(function(obj, cb) { return obj === null || typeof obj !== 'object' ? [] : Array.isArray(obj) ? obj.map(cb) : Object.keys(obj).map(function(key) { return cb(obj[key], key) });})"
    }, state.opts);

    const file = state.file;
    const comments = file.ast.comments;
    const commentsLen = comments.length;
    let comment, matches, json;

    for (let i = 0; i < commentsLen; i++) {
        comment = comments[i];
        if (!INLINE_OPTS_TREG.test(comment.value)) {
            continue;
        }

        opts.__inline = true;

        matches = INLINE_OPTS_REG.exec(comment.value);
        if (!matches) {
            break;
        }

        json = matches[1];
        try {
            Object.assign(opts, JSON.parse(json), {
                __inline: true
            });
            break;
        } catch ( err ) {
            throw file.buildCodeFrameError(comment, `Invalid options for ${ OPT_NAME } ${ json }`);
        }
        break;
    }

    return opts;
}
