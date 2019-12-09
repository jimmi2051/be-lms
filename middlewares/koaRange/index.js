let util = require("util");
let slice = require("stream-slice").slice;
let Stream = require("stream");

module.exports = strapi => {
  return {
    initialize() {
      strapi.app.use(async (ctx, next) => {
        let range = ctx.header.range;
        ctx.set("Accept-Ranges", "bytes");

        if (!range) {
          return next();
        }

        let ranges = rangeParse(range);

        if (!ranges || ranges.length == 0) {
          ctx.status = 416;
          return;
        }

        if (ctx.method == "PUT") {
          ctx.status = 400;
          return;
        }

        await next();

        if (ctx.method != "GET" || ctx.body == null) {
          return;
        }

        let first = ranges[0];
        let rawBody = ctx.body;
        let len = rawBody.length;

        // avoid multi ranges
        let firstRange = ranges[0];
        let start = firstRange[0];
        let end = firstRange[1];

        if (!Buffer.isBuffer(rawBody)) {
          if (rawBody instanceof Stream.Readable) {
            len = ctx.length || "*";
            rawBody = rawBody.pipe(slice(start, end + 1));
          } else if (typeof rawBody !== "string") {
            rawBody = new Buffer(JSON.stringify(rawBody));
            len = rawBody.length;
          } else {
            rawBody = new Buffer(rawBody);
            len = rawBody.length;
          }
        }

        //Adjust infinite end
        if (end === Infinity) {
          if (Number.isInteger(len)) {
            end = len - 1;
          } else {
            // FIXME(Calle Svensson): If we don't know how much we can return, we do a normal HTTP 200 repsonse
            ctx.status = 200;
            return;
          }
        }

        let args = [start, end + 1].filter(function(item) {
          return typeof item == "number";
        });

        ctx.set("Content-Range", rangeContentGenerator(start, end, len));
        ctx.status = 206;

        if (rawBody instanceof Stream) {
          ctx.body = rawBody;
        } else {
          ctx.body = rawBody.slice.apply(rawBody, args);
        }

        if (len !== "*") {
          ctx.length = end - start + 1;
        }
      });
    }
  };
};
function rangeParse(str) {
  let token = str.split("=");
  if (!token || token.length != 2 || token[0] != "bytes") {
    return null;
  }
  return token[1]
    .split(",")
    .map(function(range) {
      return range.split("-").map(function(value) {
        if (value === "") {
          return Infinity;
        }
        return Number(value);
      });
    })
    .filter(function(range) {
      return !isNaN(range[0]) && !isNaN(range[1]) && range[0] <= range[1];
    });
}

function rangeContentGenerator(start, end, length) {
  return util.format("bytes %d-%d/%s", start, end, length);
}
