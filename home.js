$(function () {
	chrome.runtime.getBackgroundPage(function (bgPage) {
		dns = bgPage.dns;
        $('#flushData').click(
            function()
            {
                if(!confirm('Confirm your Cache Flush operation'))
                    return;
                dns = {};
                bgPage.dns = {};
                refresh();
            }
        );
        $("form").submit(function(){
            var host = document.getElementById("host").value;
            var ip = document.getElementById("ip").value;
            if (!host.includes("(") && !ip.includes("e.g"))
                {bgPage.CacheDNS(host, ip);}
            else{
                alert("Enter valid hostname and IP");
            }
            refresh();
        });
        refresh();
	});
});



function refresh() {
	var dnsentries = $('#dnsentries').empty();
	var size = JSON.stringify(dns).length;
	var hosts = Object.keys(dns);
	var toReplace = 0;
	var displayed = 0;
	hosts.forEach(function (host) {
		var data = dns[host];
		if (data) {
			var ips = data.ips;
			var first = true;
			for (var i = ips.length - 1; i >= 0; i--) {
				(function () {
						var ip = ips[i];
						var line = ip + ' ' + host;
						var entry = $('<div></div>');
						line = '#' + line;
						dnsentries.append(entry.text(line));
				})();
			}
		}
    });
}
