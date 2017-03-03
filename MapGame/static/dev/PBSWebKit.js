var PBS = {};

PBS.cookie = {
    set: function setCookie(name,value,days) {
        var d = new Date();
        d.setTime(d.getTime() + (days*24*60*60*1000));
        var expires = "expires=" + d.toGMTString();
        document.cookie = name + "=" + value + "; " + expires;
    },
    setList: function setListOfCookies(list, log) { 
        /** [{name: '', value: '', days: 30}, {...}]*/
        for ( i = 0; i < list.length; i++ ) {
            PBS.cookie.set(list[i].name, list[i].value, list[i].days);
            if ( log && log === true ) {
                console.log('Cookie "' + list[i].name + '" was created!');
            }
        }
    },
    get: function getCookie(name) {
        var name = name + "=";
        var ca = document.cookie.split(';');
        for(var i=0; i<ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0)==' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    },
    getList: function getCookie(list) {
        this.cookieList = {};
        for ( i = 0; i < list.length; i++ ) {
            this.cookieList[list[i]] = PBS.cookie.get(list[i]);
        }
        return this.cookieList;
    },
    check: function checkCookie(name, set) {
        var cookie = PBS.cookie.get(name);
        if (cookie === "") {
            if (set) {
                PBS.cookie.set(set.name, set.value, set.days);
                console.log("The '" + name + "' cookie has been set!");
            } else {
                return false;
            }
        } else {
            return true;
        }
    },
    delete: function deleteCookie(name) {
        PBS.cookie.set(name, "", -1);
    },
    deleteList: function(list){
        for ( i = 0; i < list.length; i++ ) {
            PBS.cookie.delete(list[i]);
        }
    },
    print: function printCookie(name) {
        console.log(PBS.cookie.get(name));
    }
}
