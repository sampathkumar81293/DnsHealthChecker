dns = {};

chrome.storage.local.get('DNScache' ,
    function(data)
    {
        dns  = data.DNScache || {};
        //dns = {};
    }
);


chrome.webRequest.onBeforeRequest.addListener(function(params)
{
    console.log(params);
    console.log( /^(?:(\w+):)?\/\/([^\/\?#]+)/.exec(params.url));
    var hostdata  = parseurl(params.url);
    if (!hostdata) return;
    var data = dns[hostdata.host];
    if (!data || !data.ips.length) return;
    var ip = data.ips[data.ips.length -1];
    // extend this
}, {
    urls : ["<all_urls>"]
},
    ["blocking"]
);

function CacheDNS(host , ip){
    if (!host) return;
    var cachedata = dns[host];
    if (!cachedata || !cachedata.ips)
    {
        console.log("New entry to DNS cache");
        cachedata = {
            ips : []
        };
        dns[host] = cachedata;
    }
    if (!cachedata.ips.includes(ip)){
        console.log("Adding DNS entry in Cache"); 
        cachedata.ips.push(ip);
        }

    chrome.storage.local.set(
        {
            'DNScache' : dns
        }
    );
}

function PresentinCacheDNS(host , ip){
    if (!host) return;
    var cachedata = dns[host];
    var result = {
        first : !cachedata || !cachedata.ips 
        //second : true
    };
    if (!cachedata || !cachedata.ips)
    {
        console.log("adding ip entry to DNS cache");
        cachedata = {
            ips : []
        };
        dns[host] = cachedata;
    }
    result.second = cachedata.ips.includes(ip) ;
    return result;
}

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
        //ip = "172.217.11.14";
        var ispresent = PresentinCacheDNS(hostdata.host , ip);
        console.log("Is present : ", ispresent);
        if (!ispresent.first && !ispresent.second)
        {
            alert("DNS Spoof Alert");
            return;
        }
        CacheDNS(hostdata.host , ip);
        console.log("Logging cached dns values");
        console.log( Object.keys(dns).length);
        console.log(hostdata.host);
        console.log( dns[hostdata.host] );
        // check if this DNS is different from previous DNS resolution
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