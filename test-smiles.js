window.smls = window.smls || {};
smls.hf = smls.hf || {};

(function (ns) {
  // eslint-disable-next-line strict
  'use strict';
  ns.version = '0.1.21';

  ns.Controller = {
    TOKEN_NAME: 'session-token',
    PARAMS_TOKEN: 'st',
    DATA_USER: 'smls-user-data',
    USER_TEMPLATES: 'smls-user-tpls',
    HOST: window.location.hostname,
    LOCATION: window.location,
    DEFAULT_ENV_SERVICE: 'dev6',
    SERVICE_PARTNER_HML: 'hml5',
    smlsHFEnv: null,
    isHmlPartner: false,
    isLocalhost: false,
    isPartnerDomain: false,
    udFromLF: null,
    portalName: null,
    staticDomain: 'https://static.smiler.com.br',
    userLogged: false,
    smlsBody: null,
    smlsHeader: null,
    smlsBoxLogin: null,
    smlsBoxAccount: null,
    smlsDropdownContainer: null,
    smlsAvatarDropdownArrow: null,
    smlsMoreInfoContent: null,
    smlsMoreInfoArrow: null,
    smlsBlackout: null,
    smlsMoreInfo: null,
    smlsMoreInfoDesktopClose: null,
    smlsDrawer: null,
    smlsDrawerClose: null,
    smlsDrawerMoreInfoBack: null,
    smlsDrawerMoreInfoClose: null,
    smlsAvatar: null,
    smlsLogout: null,
    smlsAvatarDropdownContainer: null,
    smlsNotificationText: null,
    myAccountLink: null,
    optChat: null,
    changeScroll: true,
    isTransparentHeader: false,

    debug: function(message) {
      if (localStorage.getItem('smlsDebug') === 'true') {
        console.log(message);
      }
    },

    getElemId: function (objVar, domElem) {
      this[objVar] = window.document.getElementById(domElem);
    },

    initEnv: function (cb) {
      const self = this;
      self.getElemId('smlsBoxAccount', 'smls-hf-account-user');
      self.getElemId('smlsHeader', 'smls-hf-header-default');
      function getPrefix(prefix, change) {
        var index = self.HOST.indexOf(prefix);
        if (index !== -1) {
          var sufix = self.HOST.substring(index + 3, index + 4);
          return (change || prefix) + sufix;
        }
        return undefined;
      }
      function hasPartnerDomain() {
        var partners = [
          'www.shoppingsmiles.com.br',
          'hoteis.smiles.com.br',
          'carros.smiles.com.br',
          'ingresso.smiles.com.br',
          'atracoes.smiles.com.br',
          'passeios.smiles.com.br',
          'cruzeiros.smiles.com.br',
          'shoppingsmiles.myvtex.com',
          'uv2532--shoppingsmiles.myvtex.com',
          'smiles.horasmagicas.com'
        ];
        return partners.indexOf(self.HOST) > -1;
      }
      function hasHmlPartnerDomain() {
        var partners = [
          'demo.gl-tours.com',
          'hml.gopointsportal.com.br',
          'cruzeiros-hml.smiles.com.br',
          'hml-ingresso.smiles.com.br',
          'smiles.staging.front-end.rocketmiles-qa.com',
          'shoppingsmileshml.myvtex.com',
          'releaseavanti--shoppingsmileshml.myvtex.com'
        ];
        return partners.indexOf(self.HOST) > -1;
      }
      function checkNoScrollMenu() {
        var partners = [
          'hml.gopointsportal.com.br',
          'www.shoppingsmiles.com.br',
          'hoteis.smiles.com.br',
          'carros.smiles.com.br',
          'ingresso.smiles.com.br',
          'atracoes.smiles.com.br',
          'cruzeiros.smiles.com.br',
          'shoppingsmileshml.myvtex.com',
          'shoppingsmiles.myvtex.com',
          'uv2532--shoppingsmiles.myvtex.com',
          'releaseavanti--shoppingsmileshml.myvtex.com'
        ];
        return !(partners.indexOf(self.HOST) > -1);
      }
      var obj = {
        local: getPrefix('localhost'),
        hml: getPrefix('uat', 'hml'),
        dev: getPrefix('dev'),
        get: function () {
          if (this.local) {
            const getCurrentEnv = window.localStorage.getItem('smlsHFEnv');
            self.isLocalhost = true;
            if (!getCurrentEnv) return self.DEFAULT_ENV_SERVICE;
            return getCurrentEnv.toLocaleLowerCase().replace('uat', 'hml');
          }
          var current = this.hml || this.dev;
          if (current) return current;
          return 'prd';
        },
      };
      self.isHmlPartner = hasHmlPartnerDomain();
      self.isPartnerDomain = hasPartnerDomain();
      self.changeScroll = checkNoScrollMenu();
      self.smlsHFEnv = self.isHmlPartner ? self.SERVICE_PARTNER_HML : obj.get();
      if (self.smlsHFEnv !== 'prd') {
        var srcEnv = self.isHmlPartner
          ? self.SERVICE_PARTNER_HML
          : self.smlsHFEnv;
        self.portalName =
          'portal-' +
          (srcEnv.indexOf('dev') > -1 ? srcEnv : srcEnv.replace('hml', 'uat'));
        self.staticDomain =
          'https://' + self.portalName + '-static.smiler.com.br';
      }
      cb();
    },

    firstName: function (str) {
      return str.split(' ')[0];
    },

    formatNumer: function (str) {
      return String(str).replace(/(.)(?=(\d{3})+$)/g, '$1.');
    },

    getUserSession: function () {
      return JSON.parse(window.localStorage.getItem(this.DATA_USER));
    },

    getUserTemplate: function (node) {
      const templates = JSON.parse(
        window.localStorage.getItem(this.USER_TEMPLATES),
      );
      return templates[node];
    },

    getMenuOption: function (id) {
      return document.querySelector("[data-smls-main-menu='" + id + "']");
    },

    clearSession: function (cb) {
      const self = this;
      window.localStorage.removeItem(self.TOKEN_NAME);
      window.localStorage.removeItem(self.DATA_USER);
      window.localStorage.removeItem(self.USER_TEMPLATES);
      // to be remove
      window.sessionStorage.removeItem(self.TOKEN_NAME);
      cb();
    },

    getSmilesDomain: function() {
      const self = this;
      return self.smlsHFEnv === 'prd'
        ? 'https://www.smiles.com.br'
        : 'https://' + self.portalName + '.smiles.com.br';
    },

    callLogin: function () {
      const self = this;
      if (typeof window.smilesLogin === 'undefined') {
        var loginUrl = self.getSmilesDomain();
        var pathLogin = '/login';
        if (
          self.LOCATION.pathname !== '/' &&
          self.LOCATION.pathname !== '/home'
        ) {
          pathLogin += '?ref=' + encodeURIComponent(window.location.href);
        }
        loginUrl += pathLogin;
        window.location.href = loginUrl;
      } else {
        if (typeof window.smilesLogin === 'string') {
          window.location.href = window.smilesLogin;
        } else if (typeof (window.smilesLogin === 'function')) {
          window.smilesLogin();
        }
      }
    },

    getPartnerParam: function () {
      const self = this;
      const shoppingMenu = self.getMenuOption('shopping');
      if (
        shoppingMenu &&
        //shoppingMenu.classList.contains('smls-hf-active') &&
        (
            window.location.hostname.indexOf('myvtex.com') >= 0 ||
            window.location.hostname.indexOf('shoppingsmiles') >= 0
        )
      ) {
        return 'shopping';
      }
      return;
    },

    callLogout: function () {
      const self = this;
      self.clearSession(function () {
        if (typeof window.smilesLogout === 'undefined') {
          self.smlsBody.style.position = '';
          const partner = self.getPartnerParam();
          if (partner) {
            var logoutDomain = self.getSmilesDomain();
            window.location.href = `${logoutDomain}/logout?partner=${partner}`;
          } else {
            window.location.href = '/logout';
          }
        } else {
          if (typeof window.smilesLogout === 'string') {
            window.location.href = window.smilesLogout;
          } else if (typeof (window.smilesLogout === 'function')) {
            window.smilesLogout();
          }
        }
      });
    },

    smlsMoreInfoToogle: function (closeAnyWay) {
      const self = this;
      if (
        self.smlsMoreInfoContent.className.indexOf('smls-hf-is-open') >= 0 &&
        !closeAnyWay
      )
        return;
      if (closeAnyWay) {
        self.smlsMoreInfoContent.className =
          self.smlsMoreInfoContent.className.replace('smls-hf-is-open', '');
        self.smlsMoreInfoArrow.className =
          self.smlsMoreInfoArrow.className.replace('smls-hf-rotate', '');
        self.smlsBlackoutToogle(true);
      } else {
        self.smlsMoreInfoContent.className += ' smls-hf-is-open';
        self.smlsMoreInfoArrow.className += ' smls-hf-rotate';
        self.smlsBlackoutToogle();
      }
    },

    smlsBlackoutToogle: function (closeAnyWay) {
      const self = this;
      if (
        closeAnyWay ||
        self.smlsBlackout.className.indexOf('smls-hf-blackout') >= 0
      ) {
        self.smlsBlackout.className = '';
        self.smlsBody.style.position = 'initial';
        self.smlsBody.style.width = 'initial';
        if (self.changeScroll) {
          self.smlsBody.style.overflowY = 'auto';
        }
      } else {
        self.smlsBlackout.className = 'smls-hf-blackout';
        self.smlsBody.style.position = 'fixed';
        self.smlsBody.style.width = '100%';
        if (self.changeScroll) {
          self.smlsBody.style.overflowY = 'scroll';
        }
      }
    },

    smlsAvatarToogle: function (closeAnyWay) {
      const self = this;
      if (
        self.smlsDropdownContainer.className.indexOf('smls-hf-is-open') >= 0 &&
        !closeAnyWay
      )
        return;
      if (closeAnyWay) {
        self.smlsAvatarDropdownArrow.className =
          self.smlsAvatarDropdownArrow.className.replace('smls-hf-rotate', '');
        self.smlsDropdownContainer.className =
          self.smlsDropdownContainer.className.replace('smls-hf-is-open', '');
        self.smlsBoxAccount.style.zIndex = '2';
        self.smlsBlackoutToogle(true);
      } else {
        self.smlsAvatarDropdownArrow.className += ' smls-hf-rotate';
        self.smlsDropdownContainer.className += ' smls-hf-is-open';
        self.smlsBoxAccount.style.zIndex = '9999';
        self.smlsBlackoutToogle();
      }
    },

    smlsCloneElement: function () {
      var smlsAlredyExists = document.getElementById('smls-logo-smiles-clone');
      if (!smlsAlredyExists) {
        var smlsContainerToInsertClone = document.getElementsByClassName(
          'smls-hf-content-header',
        )[0];
        var smlsElement = document.getElementById('smls-logo-smiles');
        var smlsClone = smlsElement.cloneNode(true);
        smlsClone.id = 'smls-logo-smiles-clone';
        smlsClone.ariaHidden = true;
        var smlsLastElement = smlsContainerToInsertClone.children[0];
        smlsContainerToInsertClone.insertBefore(smlsClone, smlsLastElement);
      }
    },

    smlsDrawerToogle: function (closeAnyWay, menu = 'hamburger') {
      const self = this;
      if (
        closeAnyWay ||
        self.smlsHeader.className.indexOf('smls-hf-is-open') >= 0
      ) {
        if (self.isTransparentHeader) {
          self.smlsHeader.classList.add('transparent');
        }
        self.smlsHeader.className = self.smlsHeader.className.replace(
          'smls-hf-is-open',
          '',
        );
        setTimeout(function () {
          self.smlsHeader.className = self.smlsHeader.className.replace(
            'hamburger',
            '',
          );
          self.smlsHeader.className = self.smlsHeader.className.replace(
            'profile',
            '',
          );
        }, 500);
        self.smlsBody.style.position = '';
      } else {
        self.smlsCloneElement();
        self.smlsHeader.classList.add('smls-hf-is-open', menu);
        if (self.isTransparentHeader) {
          self.smlsHeader.classList.add('transparent');
        }
        self.smlsBody.style.position = 'fixed';
        setTimeout(function () {
          self.smlsHeader.classList.remove('transparent');
        }, 500);
      }
    },

    checkUserToken: function (cb) {
      const self = this;
      function getQueryParam(params) {
        var query = window.location.search.substring(1);
        var vars = query.split('&');
        for (var i = 0; i < vars.length; i++) {
          var pair = vars[i].split('=');
          if (decodeURIComponent(pair[0]) == params) {
            return decodeURIComponent(pair[1]);
          }
        }
      }
      function removeQueryParam(params) {
        // Verificar se precisa refatorar a funcao removeQueryParam
        var query = window.location.search.substring(1);
        var vars = query.split('&');
        var newQs = '';
        for (var i = 0; i < vars.length; i++) {
          var pair = vars[i].split('=');
          if (decodeURIComponent(pair[0]) !== params) {
            if (newQs !== '') newQs += '&';
            newQs += pair[0] + '=' + pair[1];
          }
        }
        if (newQs !== '') newQs = '?' + newQs;
        // Rever a Sintaxe pushState
        window.history.pushState(
          {},
          document.title,
          window.location.pathname + newQs,
        );
      }
      function isTokenValid(token) {
        if (token.length > 256) {
          var base64Url = token.split('.')[1];
          var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          var jsonPayload = decodeURIComponent(
            atob(base64)
              .split('')
              .map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
              })
              .join(''),
          );
          var objToken = JSON.parse(jsonPayload);
          var currTime = Math.floor(new Date().getTime() / 1000.0);
          return parseInt(objToken.exp) > parseInt(currTime);
        } else {
          var ud = atob(token).split('|');
          if (ud.length === 3) {
            self.udFromLF = token;
            return true;
          }
          return false;
        }
      }
      var sessionToken = window.localStorage.getItem(self.TOKEN_NAME);
      if (sessionToken) {
        if (isTokenValid(sessionToken)) {
          self.userLogged = true;
        } else {
          self.clearSession(function () {
            self.userLogged = false;
          });
        }
      } else {
        var tokenParams = getQueryParam(self.PARAMS_TOKEN);
        if (tokenParams) {
          // Permite o envio do Token queryString somente para os parceiros
          removeQueryParam(self.PARAMS_TOKEN);
          if (isTokenValid(tokenParams)) {
            window.localStorage.setItem(self.TOKEN_NAME, tokenParams);
            self.userLogged = true;
          } else {
            self.userLogged = false;
            self.clearSession(function () {
              self.userLogged = false;
            });
          }
        } else if (typeof window.Liferay !== 'undefined') {
          if (typeof window.smlsUD !== 'undefined' && window.smlsUD !== '') {
            self.udFromLF = window.smlsUD;
            self.userLogged = true;
          }
        }
      }
      cb();
    },

    checkLinkDomain: function (str, type) {
      var wkStr = str;
      function checkPartnerLink(st, tp) {
        const partnerLink = [
          'https://www.shoppingsmiles.com.br/smiles/index.jsf',
          'https://carros.smiles.com.br/smiles_carros/carro_index.jsf',
          'https://atracoes.smiles.com.br/smiles_atracoes/index.jsf',
        ];
        const hmlLink = [
          'https://hml.gopointsportal.com.br/smiles/index.jsf',
          'https://hml.gopointsportal.com.br/smiles_carros/catalogo.jsf',
          'https://hml.gopointsportal.com.br/smiles_atracoes/index.jsf',
        ];
        if (tp === 'link') {
          if (partnerLink.indexOf(st) > -1) {
            st = hmlLink[partnerLink.indexOf(st)];
          }
        } else {
          for (var i = 0; i < partnerLink.length; i++) {
            if (st.indexOf(partnerLink[i]) > -1) {
              st = st.replaceAll(partnerLink[i], hmlLink[i]);
            }
          }
        }
        return st;
      }
      if (str.indexOf('www.smiles.com.br') > -1) {
        wkStr = str.replace(
          'www.smiles.com.br',
          this.portalName + '.smiles.com.br',
        );
      } else if (type === 'link') {
        wkStr = checkPartnerLink(str, type);
      }
      if (type === 'html') {
        wkStr = checkPartnerLink(wkStr, type);
      }
      return wkStr;
    },

    changeLinks: function () {
      const self = this;
      var hfIds = ['smls-hf-header-default', 'smls-hf-footer-default'];
      for (var i = 0; i < hfIds.length; i++) {
        var elem = document.getElementById(hfIds[i]);
        if (elem) {
          var lkArray = elem.getElementsByTagName('a');
          for (var z = 0; z < lkArray.length; z++) {
            lkArray[z].setAttribute(
              'href',
              self.checkLinkDomain(lkArray[z].href, 'link'),
            );
          }
        }
      }
    },

    checkLinkHome: function () {
      var lkHome = document.getElementById('smls-logo-smiles');
      var param = lkHome.href.indexOf('?') > -1 ? '&upd=' : '?upd=';
      lkHome.href = lkHome.href + param + new Date().getTime();
    },

    activePartnerMenu: function () {
      const self = this;
      const hotelDomains = [
        'hoteis.smiles.com.br',
        'smiles.staging.front-end.rocketmiles-qa.com',
      ];
      const shoppingDomains = [
        'www.shoppingsmiles.com.br',
        'hml.gopointsportal.com.br',
        'shopping.smiles.com.br',
        'shoppingsmileshml.myvtex.com',
        'shoppingsmiles.myvtex.com',
        'uv2532--shoppingsmiles.myvtex.com',
        'releaseavanti--shoppingsmileshml.myvtex.com'
      ];
      const carsDomains = ['carros.smiles.com.br'];
      const otherPartners = [
        'atracoes.smiles.com.br',
        'ingresso.smiles.com.br',
        'cruzeiros.smiles.com.br',
        'passeios.smiles.com.br',
        'smiles.horasmagicas.com'
      ];
      if (hotelDomains.indexOf(self.HOST) > -1) {
        self.getMenuOption('hoteis').classList.add('smls-hf-active');
      } else if (shoppingDomains.indexOf(self.HOST) > -1) {
        self.getMenuOption('shopping').classList.add('smls-hf-active');
      } else if (carsDomains.indexOf(self.HOST) > -1) {
        self.getMenuOption('carros').classList.add('smls-hf-active');
      } else if (otherPartners.indexOf(self.HOST) > -1) {
        self.getMenuOption('more').classList.add('smls-hf-active');
      }
    },

    setTransparentHeader: function (bool) {
      const self = this;
      const hasTransparency = self.smlsHeader.classList.contains('transparent');
      if (bool && !hasTransparency) {
        self.smlsHeader.classList.add('transparent');
      }

      if (!bool && hasTransparency) {
        self.smlsHeader.classList.remove('transparent');
      }
    },

    initCommonsElements: function () {
      const self = this;
      self.smlsBody = window.document.getElementsByTagName('body')[0];
      self.getElemId('smlsBoxLogin', 'smls-hf-box-login');
      self.getElemId('smlsMoreInfoContent', 'smls-hf-content-more');
      self.getElemId('smlsMoreInfoArrow', 'smls-hf-routes-more');
      self.getElemId('smlsBlackout', 'smls-hf-blackout');
      self.getElemId('smlsMoreInfo', 'smls-hf-drop_plus');
      self.getElemId('smlsMoreInfoDesktopClose', 'smls-hf-btn_close');
      self.getElemId('smlsDrawer', 'smls-hf-header-drawer');
      self.getElemId('smlsDrawerClose', 'smls-hf-header-drawer-close');
      self.getElemId('smlsDrawerMoreInfoBack', 'smls-hf-more-back');
      self.getElemId('smlsDrawerMoreInfoClose', 'smls-hf-more-close');
      self.getElemId('optChat', 'smls-hf-opt_chat');
      self.getElemId('smlsHeader', 'smls-hf-header-default');

      const isTransparentHeader = self.smlsHeader.classList.contains('transparent');
      self.isTransparentHeader = isTransparentHeader;
      if (isTransparentHeader) {
        self.smlsHeader.addEventListener('mouseover', function () {
          self.setTransparentHeader(false);
        });
        self.smlsHeader.addEventListener('mouseleave', function () {
          self.setTransparentHeader(true);
        });
      }

      self.smlsDrawer.addEventListener('click', function () {
        self.smlsDrawerToogle();
      });

      self.smlsDrawerClose.addEventListener('click', function () {
        self.smlsDrawerToogle(true);
      });

      self.smlsDrawerMoreInfoBack.addEventListener('click', function () {
        self.smlsMoreInfoToogle(true);
      });

      self.smlsDrawerMoreInfoClose.addEventListener('click', function () {
        self.smlsMoreInfoToogle(true);
        self.smlsDrawerToogle(true);
      });

      self.smlsMoreInfo.addEventListener('mouseenter', function () {
        if (window.innerWidth >= 1240) {
          self.smlsMoreInfoToogle();
        }
      });

      self.smlsMoreInfo.addEventListener('click', function (e) {
        e.preventDefault();
        if (window.innerWidth < 1240) {
          self.smlsMoreInfoToogle();
        }
      });

      self.smlsMoreInfo.addEventListener('mouseleave', function (e) {
        if (window.innerWidth >= 1240) {
          var elemBounding = self.smlsMoreInfo.getBoundingClientRect();
          var mouseOutOfBottom = elemBounding.bottom - e.pageY;
          if (mouseOutOfBottom > 0) {
            self.smlsMoreInfoToogle(true);
          }
        }
      });

      self.smlsMoreInfoDesktopClose.addEventListener('click', function () {
        self.smlsMoreInfoToogle(true);
      });

      self.smlsBlackout.addEventListener('mouseenter', function () {
        self.smlsMoreInfoToogle(true);
        if (self.userLogged) {
          self.smlsAvatarToogle(true);
        }
      });

      self.smlsMoreInfoContent.addEventListener('mouseleave', function () {
        if (window.innerWidth >= 1240) {
          self.smlsMoreInfoToogle(true);
        }
      });

      self.smlsMoreInfoContent.addEventListener('scroll', function () {
        if (window.innerWidth < 1240) {
          var mobileMoreHeader = document.getElementsByClassName(
            'smls-hf-content-more-header',
          )[0];
          var position = self.smlsMoreInfoContent.scrollTop;
          if (position > 50) {
            mobileMoreHeader.style.boxShadow =
              '0px 0px 16px rgba(0, 0, 0, 0.12)';
          } else {
            mobileMoreHeader.style.boxShadow = 'none';
          }
        }
      });

      if (self.optChat) {
        self.optChat.addEventListener('click', function (e) {
          if (typeof Smooch !== 'undefined') {
            e.preventDefault();
            Smooch.open();
          }
        });
      }
    },

    renderBoxLogin: function () {
      const self = this;
      self.smlsBoxLogin.innerHTML =
        '<a class="smls-hf-btn-hyperlink-border smls-hf-profile" href="javascript:smls.hf.Controller.callLogin()" title="Entrar" id="smls-hf-btn_toEnter"> <i class="smls-hf-icon profile-black"></i> Entrar </a>';
    },

    renderUserData: function () {
      const self = this;
      var userMenu = self.getUserTemplate('contentHtml');
      var userData = self.getUserSession();
      var mobileMenuActions =
        document.getElementsByClassName('smls-hf-actions')[0];
      var ckAvatar = document.getElementById('smls-hf-img_profile');
      if (ckAvatar === null) {
        var mobileAvatarIcon = document.createElement('div');
        mobileAvatarIcon.className = 'smls-hf-avatar';
        mobileAvatarIcon.innerHTML =
          '<div class="smls-hf-avatar-container" id="smls-hf-img_profile"> <i class="smls-hf-icon profile-black"></i></div>';
        mobileMenuActions.prepend(mobileAvatarIcon);
      }
      userMenu = userMenu.replace(
        /\${user_name}/,
        self.firstName(userData.firstName),
      );
      userMenu = userMenu.replace(
        /\${user_miles}/,
        self.formatNumer(userData.milesBalance),
      );
      userMenu = userMenu.replace(/\${member_number}/, userData.memberNumber);
      if (self.smlsHFEnv !== 'prd') {
        userMenu = userMenu.replaceAll(
          'www.smiles',
          self.portalName + '.smiles',
        );
      }
      self.smlsBoxAccount.innerHTML = userMenu;
      self.getElemId('smlsDropdownContainer', 'smls-hf-dropdown-container');
      self.getElemId('smlsAvatarDropdownArrow', 'smls-hf-drop_profile');
      self.getElemId('smlsAvatar', 'smls-hf-img_profile');
      self.getElemId('smlsLogout', 'smls-hf-btn_exit');
      self.getElemId('smlsAvatarDropdownContainer', 'smls-hf-avatar-dropdown');
      self.getElemId('myAccountLink', 'smls-hf-opt_myAccount');

      self.smlsBoxAccount.addEventListener('mouseenter', function (e) {
        self.smlsAvatarToogle();
        e.stopPropagation();
      });

      self.smlsBoxAccount.addEventListener('mouseleave', function (e) {
        var elemBounding =
          self.smlsAvatarDropdownContainer.getBoundingClientRect();
        var mouseOutOfBottom = elemBounding.bottom - e.pageY;
        if (mouseOutOfBottom > 0) {
          self.smlsAvatarToogle(true);
          e.stopPropagation();
        }
      });

      self.smlsDropdownContainer.addEventListener('mouseenter', function (e) {
        self.smlsAvatarToogle();
        e.stopPropagation();
      });

      self.smlsLogout.addEventListener('click', function (e) {
        if (e.detail === 1) {
          self.callLogout();
        }
      });

      self.smlsAvatar.addEventListener('click', function () {
        self.smlsDrawerToogle(false, 'profile');
      });

      self.myAccountLink.addEventListener('click', function (e) {
        if (typeof window.Liferay !== 'undefined') {
          if (Liferay.Browser.isMobile()) {
            try {
              self.smlsDrawerToogle(true);
              LoginPortletController.dropdownMenu();
              e.preventDefault();
            } catch (err) {
              console.log('DropdownMenu not found');
            }
          }
        }
      });

      self.customFooter(userData);
    },

    customFooter: function (userData) {
      const self = this;
      const elmId01 = 'smls-dynamic-msg01';
      var elem = window.document.getElementById(elmId01);
      if (elem) {
        var dynMsg01 = self.getUserTemplate(elmId01);
        dynMsg01 = dynMsg01.replace(
          /\${user_name}/,
          self.firstName(userData.firstName),
        );
        if (self.smlsHFEnv !== 'prd') {
          dynMsg01 = self.checkLinkDomain(dynMsg01, 'html');
        }
        elem.innerHTML = dynMsg01;
      }
    },

    notificationCallback: function (count) {
      var self = this;
      self.getElemId('smlsNotificationText', 'smls-hf-opt_notifications');
      var smlsAvatarContainer = document.getElementsByClassName(
        'smls-hf-avatar-container',
      );
      var i = 0;
      if (Number(count) > 0) {
        self.smlsAvatar.classList.add('has-notification');
        self.smlsNotificationText.innerText =
          'NotificaÃ§Ãµes ' + '(' + count + ')';
        for (i; i < smlsAvatarContainer.length; i++) {
          smlsAvatarContainer[i].classList.add('has-notification');
        }
      } else {
        self.smlsNotificationText.innerText = 'NotificaÃ§Ãµes';
        for (i; i < smlsAvatarContainer.length; i++) {
          smlsAvatarContainer[i].classList.remove('has-notification');
        }
      }
    },

    initNotifications: function () {
      if (localStorage.getItem('notificationConfig') && typeof window.smlsNotificationConfig !== 'object') {
        try {
          window.smlsNotificationConfig = JSON.parse(localStorage.getItem('notificationConfig'));
        } catch(e) {
          console.log('could not parse notificationConfig', e);
        }
      }
      if (typeof window.smlsNotificationConfig === 'object') {
        var member = this.getUserSession();
        if (member && member.memberNumber) {
          ns.notification.Loader.initNotificationsCounter(
            window.smlsNotificationConfig.identityIdAws,
            window.smlsNotificationConfig.tokenAws,
            window.smlsNotificationConfig.appsyncEndpoint,
            member.memberNumber,
            (count) => this.notificationCallback(count),
          );
        }
      }
    },

    loadUserData: function (cb) {
      const self = this;
      if (self.udFromLF === null) {
        self.callService(cb);
      } else {
        var ud = atob(self.udFromLF).split('|');
        var dataUser = {
          memberNumber: ud[0],
          firstName: ud[1],
          milesBalance: ud[2],
        };
        window.localStorage.setItem(self.DATA_USER, JSON.stringify(dataUser));
        cb(true);
      }
    },

    callService: function (cb) {
      const self = this;
      var token = window.localStorage.getItem(self.TOKEN_NAME);
      var url =
        'https://members-' + self.smlsHFEnv + '.smiles.com.br/v1/members/info';
      fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
      })
        .then(function (response) {
          if (!response.ok) {
            throw new Error('SmlsHF getMemberInfo error');
          }
          response.json().then(function (result) {
            window.localStorage.setItem(
              self.DATA_USER,
              JSON.stringify(result.data),
            );
            cb(true);
          });
        })
        .catch(function () {
          cb(false);
        });
    },

    loadUserTemplates: function (cb) {
      // Ler em segundo plano caso os dados estejam no Session Storage e ataulizar a qtde de milhas
      const self = this;
      var baseUrl = self.staticDomain + '/hf';
      var url = baseUrl + '/smls-user-menu.json?v=2';

      fetch(url, {
        method: 'GET',
      })
        .then(function (response) {
          if (!response.ok) {
            throw new Error('Get User menu error');
          }
          response.json().then(function (result) {
            window.localStorage.setItem(
              self.USER_TEMPLATES,
              JSON.stringify(result),
            );
            cb(true);
          });
        })
        .catch(function () {
          cb(false);
        });
    },

    alreadyLogged: function (sessionToken, err) {
      const self = this;

      if (err) {
        console.log("alreadyLogged: ", err);
      } else if (sessionToken) {
        window.localStorage.setItem(self.TOKEN_NAME, sessionToken);

        if (typeof window.smlsSetSessionPartnerToken === 'function') {
          window.smlsSetSessionPartnerToken(sessionToken);
        }
      }

      window.smlsReloadHeader();
    },

    checkAlreadyLogged: function (partner) {
      const self = this;

      var ifrm = document.createElement('iframe');
      var loginDomain = self.getSmilesDomain();
      ifrm.setAttribute('src', `${loginDomain}/login/${partner}`);
      ifrm.style.display = 'none';
      document.body.appendChild(ifrm);
      ifrm.addEventListener(
        'load',
        function () {
          self[`smlsCheckAlreadyLogged_${partner}`] = true;
          console.log(`checkAlreadyLogged: iframe ${partner} loaded`);
        },
        true,
      );
    },

    checkPartnerToken: function() {
      try {
        const self = this;

        const partner = self.getPartnerParam();
        let triedAlreadyLogged = false;
        if (partner) {
          triedAlreadyLogged = self[`smlsCheckAlreadyLogged_${partner}`];
        }
        if (triedAlreadyLogged) {
          var smlsSessionToken = window.localStorage.getItem(
            `smls-${self.TOKEN_NAME}`,
          );
          if (smlsSessionToken) {
            window.localStorage.setItem(self.TOKEN_NAME, smlsSessionToken);
            window.localStorage.removeItem(`smls-${self.TOKEN_NAME}`);
          }
        }
      } catch (e) {
        console.error(e);
      }
    },

    initNotLogged: function () {
      const self = this;

      const partner = self.getPartnerParam();
      let checkAlreadyLogged = false;
      if (partner) {
        checkAlreadyLogged = !self[`smlsCheckAlreadyLogged_${partner}`];
      }

      if (checkAlreadyLogged) {
        self.checkAlreadyLogged(partner);
      } else {
        self.smlsHeader.classList.remove('smls-hf-logged');
        self.smlsBoxAccount.innerHTML = '';
        self.clearSession(function () {
          self.renderBoxLogin();
        });
      }
    },

    initLogged: function () {
      const self = this;
      self.smlsHeader.classList.add('smls-hf-logged');
      self.smlsBoxLogin.innerHTML = '';
      self.loadUserData(function (isLoaded) {
        if (isLoaded) {
          self.loadUserTemplates(function () {
            self.renderUserData();
            self.checkLinkHome();
            if (!self.isPartnerDomain && !self.isHmlPartner) {
              self.initNotifications();
            }
          });
        }
      });
    },

    init: function () {
      console.log('init called')
      const self = this;
      self.initCommonsElements();
      self.activePartnerMenu();
      self.initEnv(function () {
        if (self.smlsHFEnv !== 'prd') self.changeLinks();
        self.checkUserToken(function () {
          if (self.userLogged) {
            self.initLogged();
          } else {
            self.initNotLogged();
          }
        });
      });
    },
  };

  ns.util = {
    Common: {
      loadScript: (srcUrl) => {
        var j = document.createElement('script');
        j.type = 'text/javascript';
        j.src = srcUrl;
        document.getElementsByTagName('head')[0].appendChild(j);
      },
    },
  };

  ns.notification = {
    Loader: {
      notificationConfig: null,

      initNotificationsCounter: function (
        identityIdAws,
        tokenAws,
        appsyncEndpoint,
        memberNumber,
        notificationCallback,
      ) {
        if (this.notificationConfig != null) {
          console.log('Notification already initialized.');
          return;
        }

        if (!identityIdAws || !appsyncEndpoint || !tokenAws || !memberNumber) {
          throw new Error('Invalid configuration.');
        }

        this.notificationConfig = {
          identityIdAws: identityIdAws,
          tokenAws: tokenAws,
          appsyncEndpoint: appsyncEndpoint,
          memberNumber: memberNumber,
          notificationCallback: notificationCallback,
        };
        this.loadAllJs();
      },

      loadAllJs: function () {
        const jsUrl = ns.Controller.staticDomain + '/hf/notifications/';
        const jsFiles = [
          'lib/aws-amplify.js',
          'lib/browser-polyfill.min.js',
          'lib/graphql-tag.0.1.14.js',
          'lib/subscriptions-transport-ws.js',
          'NotificationController.js',
        ];

        jsFiles.forEach((file) => {
          ns.util.Common.loadScript(jsUrl + file);
        });
      },
    },
  };
})(smls.hf);

window.smlsOnMessage = function (event) {
  smls.hf.Controller.debug(event);
  const smilesDomain = smls.hf.Controller.getSmilesDomain();
  smls.hf.Controller.debug(smilesDomain);
  if (event.origin !== smilesDomain) return;

  const data = event.data;
  if (data && data.type === 'smlsAlreadyLogged') {
    smls.hf.Controller.alreadyLogged(data.sessionToken, data.err);
  }
};
if (window.addEventListener) {
  window.addEventListener('message', window.smlsOnMessage, false);
} else if (window.attachEvent) {
  window.attachEvent('onmessage', window.smlsOnMessage, false);
}

window.smlsReloadHeader = function () {
  console.log(`smlsReloadHeader called`)
  smls.hf.Controller.checkPartnerToken();
  smls.hf.Controller.init();
};

if (typeof window.smlsSpa === 'undefined') {
  if (document.readyState === 'complete') {
    smls.hf.Controller.init();
  } else {
    document.addEventListener('DOMContentLoaded', function () {
      smls.hf.Controller.init();
    });
  }
}
