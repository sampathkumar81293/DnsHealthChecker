dns = {};

chrome.storage.local.get('DNScache' ,
    function(data)
    {
        dns  = data.DNScache || {};
        // dns = {};
    }
);


chrome.browserAction.onClicked.addListener(function () {
	chrome.tabs.create({
		url : 'home.html'
	});
});


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
            ips : [],
            lps : 0,
            alert : false
        
        };
        dns[host] = cachedata;
    }
    if (!cachedata.ips.includes(ip)){
        console.log("Adding DNS entry in Cache"); 
        cachedata.ips.push(ip);
        var lcpdata = lcp(cachedata.ips);
        cachedata.lps = lcpdata;
        console.log(cachedata.lps);
        }

    chrome.storage.local.set(
        {
            'DNScache' : dns
        }
    );
}

function setAlert(host, alertval)
{
    if (!host) return;
    var cachedata = dns[host];
    if (!cachedata || !cachedata.ips)
    {
        cachedata = {
            ips : [],
            lps : -1,
            alert : alertval
        
        };
        dns[host] = cachedata;
    }
    cachedata.alert = alertval;
    dns[host] = cachedata;
    chrome.storage.local.set(
        {
            "DNScache" : dns
        }
    );

}


function lcp(arr){

    var sortArr = arr.sort(); 
    var arrFirstElem = arr[0];
    var arrLastElem = sortArr[sortArr.length - 1]; 
    var arrFirstElemLength = arrFirstElem.length; 
    
    var i= 0;
    while(i < arrFirstElemLength && arrFirstElem.charAt(i) === arrLastElem.charAt(i)) {
      i++;
    }
    // console.log(arrFirstElem.substring(0, i));
    var result =
    {
        len : i,
        str : arrFirstElem.substring(0, i)
    };
    return result;
}


function PresentinCacheDNS(host , ip){
    if (!host) return;
    var cachedata = dns[host];
    var result = {
        first : !cachedata || !cachedata.ips ,
        second : false
    };
    if (!cachedata || !cachedata.ips)
    {
        console.log("adding ip entry to DNS cache");
        cachedata = {
            ips : []
        };
        dns[host] = cachedata;
    }
    chrome.storage.local.set(
        {
            'DNScache' : dns
        }
    );

    if (!cachedata.ips) {
        result.second = cachedata.ips.includes(ip) ;
    }
    return result;
}

chrome.webRequest.onCompleted.addListener(function(params)
{
    console.log(params);
    console.log( /^(?:(\w+):)?\/\/([^\/\?#]+)/.exec(params.url));
    var hostdata  = parseurl(params.url);
    if (!hostdata) return;
	var host = hostdata.host;
    if (host.indexOf("www.") == -1) return;
    if( host.indexOf("google") != -1 ) return;
    var ip = params.ip;
    if ( ip == hostdata.host)
    {
        return;
    }
    if (ip) 
    {
        // ip = "170.3.243.45";
        console.log("Values that are being checked : " , hostdata.host , ip);
        var ispresent = PresentinCacheDNS(hostdata.host , ip);
        console.log("Is present : ", ispresent);
        CacheDNS(hostdata.host , ip);
        cachedata = dns[hostdata.host];
        var lcpdata = lcp(cachedata.ips);
        // console.log("length of the lps : ", lcpdata.len);
        console.log(countdots(lcpdata.str , "."));
        if ( countdots(lcpdata.str , ".") < 2)
        {
            if (!cachedata.alert)
            {
                setAlert(hostdata.host, true);
                alert("Possible case of DNS poisoning");
                return;
            }
        }
        console.log("Logging cached dns values");
        // console.log( Object.keys(dns).length);
        console.log(hostdata.host);
        console.log( dns[hostdata.host] );
        // check if this DNS is different from previous DNS resolution
        // }
    }
}, {
    urls : ["<all_urls>"]
},
    []
);


function countdots(text , char)
{
    var stringsearch = char ,str = text;
 for(var i=count=0; i<str.length; count+=+(stringsearch===str[i++]));
 return count;

}
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