

chrome.webRequest.onCompleted.addListener(function(params)
{
    console.log(params);
    console.log( /^(?:(\w+):)?\/\/([^\/\?#]+)/.exec(params.url));
    var hostdata  = parseurl(params.url);
    if (!hostdata) return;
    var ip = params.ip;
    if ( ip == hostdata.host)
    {
        return;
    }
    if (ip) 
    {
        console.log("Adding resolved DNS entry in Cache");
        // check if this DNS is diffirent from previous DNS resolution
        // CacheDNS(hostdata.host , ip)
    }
}, {
    urls : ["<all_urls>"]
},
    []
);

function parseurl(url)
{
    var res = /^(?:(\w+):)?\/\/([^\/\?#]+)/.exec(url);
    if ( !res || !res[2])
    {
        console.log("cannot parse url: ", url);
        return null;
    }
    var result = {
        header : res[1],
        host : res[2]
    };

    return result;
}