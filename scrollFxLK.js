class scrollFxLK {

    /**
    v1.1.1
    2023.06 Lin.K (tabooo@naver.com, nihilin@gmail.com)
    **/

    constructor(objs={}) {
        this.objs = objs;
        this.autoLoadSelector = {
            mediaAutoPlay : '.media_auto_play',
            imgLazyLoad : '.img_lazy_load',
            htmlLazyLoad : '.html_lazy_load'
        }
        this.mediaLoadTryMax = 4;
        this.monitor = false;
        this.helpMode = false;
    }

    fxItems = {};
    #scrollTick = true;
    #resizeTick = true;
    #dHeight = 0;
    #wHeight = 0;
    #lazyItems = [];

    fxInfo = {
        mediaAutoPlay: {
            desc: '스크롤 위치에 따른 동영상 제어',
            error: '동영상을 불러오는데 실패했습니다.',
            require: {service:'vimeo / youtube',code:'동영상 ID'},
            options: {lazy:'스크롤 위치에 따라 로딩'},
            initFunc: ($elem)=>{
                if ( ! scrollFxLK.#getMediaAPI( $elem.dataset.service ) ) return false;
                const $child = document.createElement('div');
                $child.id = $elem.id+'fxWrap';
                $child.style.width = '100%';
                $child.style.height = '100%';
                $elem.append( $child );
                $elem.style.position = 'relative';
                if ($elem.dataset.lazy==='true') this.#lazyItems.push($elem.id);
            },
        },
        imgLazyLoad: {
            force: true,
            desc: '스크롤이 일정 위치에 도달시 이미지 불러오기',
            error: '이미지를 불러올 수 없습니다.',
            require: {url:'이미지 경로'},
            options: {alt:'alt 속성'},
            initFunc: ($elem)=>{ if ( ! $elem.dataset.url ) return false },
        },
        htmlLazyLoad: {
            force: true,
            desc: '스크롤이 일정 위치에 도달시 HTML 불러오기',
            error: 'URL을 불러올 수 없습니다.',
            require: {url:'HTML 경로'},
            options: {filter:'불러온 HTML페이지 안에서 가져올 요소 ID'},
            initFunc: ($elem)=>{ if ( ! $elem.dataset.url ) return false },
        },
        float: {
            desc: '해당 요소가 창의 최상단에 도달 시 .fixed 클래스 추가, 화면 위로 사라지면 .bottom 클래스 추가',
        },
        bga: {
            desc: '스크롤 위치에 따라 백그라운드를 상하 애니메이션 시키며 패럴랙스 느낌의 효과',
            error: '하위요소가 없거나, 부모요소의 높이가 더 큽니다.',
            options: {filter:'애니메이션 시킬 요소 ID'},
            initFunc: ($elem)=>{
                const $child = ($elem.dataset.filter) ? $elem.querySelector( '#'+$elem.dataset.filter ) : $elem.children[0];
                if (!$child || $child.offsetHeight <= $elem.offsetHeight) {
                    return false;
                } else {
                    $elem.style.position = 'relative';
                    $elem.style.overflow = 'hidden';
                    $child.style.position = 'absolute';
                    $child.style.display = 'block';
                    $child.style.width = '100%';
                    $child.style.objectFit = 'cover';
                    $child.style.zIndex = 0;
                    return true;
                }
            },
        },
        active: {
            force: true,
            desc: '스크롤이 일정 위치에 도달시 .active 클래스 추가',
            options: {norepeat:'한 번만 실행 시킴'},
        },
        chainActive: {
            force: true,
            desc: '스크롤이 일정 위치에 도달시 하위요소들에 순차적으로 .active 클래스 추가',
            error: '하위요소를 찾을 수 없습니다.',
            options: {norepeat:'한 번만 실행 시킴', speed:'실행속도', filter:'적용할 하위요소들의 class'},
            initFunc: ($elem)=>{
                const $children = $elem.dataset.filter ? $elem.getElementsByClassName($elem.dataset.filter) : $elem.children;
                if (!$children) return false
            }
        },
        counter: {
            force: true,
            desc: '스크롤이 일정 위치에 도달시 0부터 숫자 카운트업',
            error: 'data-num 값이 존재하지 않거나 숫자가 아닙니다.',
            require: {num:'카운트 시킬 숫자'},
            options: {speed:'실행속도, 크게 설정할수록 느립니다'},
            initFunc: ($elem)=>{
                const $item = $elem.querySelectorAll('[data-num]');
                if ( $item.length < 1 ) return false;
                for (let i=0; i<$item.length; i++) if (isNaN($item[i].dataset.num*1)) return false;
            }
        },
        typewrite: {
            force: true,
            desc: '문자열을 한 글자씩 뿌리는 타자기 효과',
            error: '문자열이 존재하지 않습니다.',
            options: {str:'뿌려줄 문자열', norepeat:'한 번만 실행 시킴'},
            initFunc: ($elem)=>{
                if ( !$elem.dataset.str ) $elem.dataset.str = $elem.innerText;
                if ( $elem.dataset.str.length < 1 ) return false;
            }
        },
        marquee: {
            desc: '스크롤이 일정 위치에 도달시 왼쪽 방향으로 끊임없이 횡스크롤',
            error: '자식요소가 존재하지 않습니다.',
            options: {speed:'이동 속도, 크게 설정할수록 빠릅니다.'},
            initFunc: ($elem)=>{
                $elem.style.overflow = 'hidden';
                $elem.style.position = 'relative';
                $elem.style.width = '100%';
                $elem.style.maxWidth = '100vw';
                $elem.style.minHeight = $elem.offsetHeight+'px';
                [ ...$elem.children ].forEach(_child =>{ _child.style.display = 'inline-block' });

                const _content = $elem.innerHTML;

                const $wrapper = document.createElement('div');
                $wrapper.style.whiteSpace = 'nowrap';
                $wrapper.id = $elem.id+'sfxmq';
                $elem.innerHTML = '';
                $elem.append($wrapper);

                const $item = document.createElement('div');
                $item.style.height = $elem.offsetHeight+'px';
                $item.style.float = 'left';
                $item.innerHTML = _content;
                $wrapper.append($item);
            }
        },
        bounce: {
            desc: '스크롤이 일정 위치에 도달시 통통 튀는 효과',
        },
        paused: {
            desc: '스크롤이 멈추고 1초 후 .active 클래스 추가, 스크롤이 시작되면 active 클래스 제거',
        },
        fadeIn: {
            desc: '스크롤 위치에 따라 페이드인',
        },
        fadeOut: {
            desc: '스크롤 위치에 따라 페이드아웃',
        }
    }

    init = ()=>{

        //자동적용
        let _idFix = 0;
        for (let func in this.autoLoadSelector) {
            document.querySelectorAll( this.autoLoadSelector[func] ).forEach((item, idx)=>{
                if ( ! item.id ) item.id = func + Math.floor(Math.random() * 100) + _idFix;
                if ( ! (this.objs).hasOwnProperty(item.id) ) this.objs[item.id] = func;
                _idFix++;
            })
        }
        _idFix = null;

        for (let elem in this.objs) {
            //오류 제거
            const $elem = document.getElementById(elem);
            const fx = this.objs[elem];
            if ( ! $elem || document.querySelectorAll('#'+elem).length > 1 ) {
                this.#error(elem, 'element');
                continue;
            }
            if ( ! Object.keys(this.fxInfo).includes( fx ) ) {
                this.#error(elem,'fx');
                continue;
            }
            if ( $elem.dataset.speed && isNaN($elem.dataset.speed) ) {
                this.#error(elem, fx);
                continue;
            }
            if (this.fxInfo[fx].initFunc) {
                if (this.fxInfo[fx].initFunc($elem)===false) {
                    this.#error(elem, fx);
                    continue;
                }
            }
            //헬프모드
            if (this.helpMode===true) this.help(this.objs[elem]);
            //객체 생성
            this.fxItems[elem] = {
                activeStatus: 1,
                fx: this.objs[elem]
            };
        }

        for (let fx in this.fxInfo) delete this.fxInfo[fx].initFunc;

        if ( Object.keys( this.fxItems ).length > 0 ) {
            this.setup();
            this.#scrollEvent();
            document.addEventListener('scroll', ()=>this.#scrollEvent(), { passive: true });
            window.addEventListener('resize', ()=>{
                clearTimeout( this.#resizeTick );
                this.#resizeTick = setTimeout(()=>{
                    this.setup();
                },500);
            }, { passive: true });
        }

        if (this.monitor !== false) {
            this.#heightMonitor();
        }
    }

    setup = ()=>{
        const fxsTight = ['float'];
        const fxsLoose = ['imgLazyLoad','htmlLazyLoad'];

        this.#wHeight = window.innerHeight;
        for (let elem in this.objs) {
            const $elem = document.getElementById(elem);
            if (this.fxItems[elem].fx==='paused') {
                this.fxItems[elem].start = 0;
                this.fxItems[elem].end = document.body.offsetHeight;
            } else {
                const _startFix =
                    fxsTight.includes( this.objs[elem] ) ? 0 :
                    ( fxsLoose.includes(this.objs[elem]) || this.#lazyItems.includes(elem) ) ? this.#wHeight*1.5 : this.#wHeight;
                this.fxItems[elem].start =  Math.floor(window.scrollY + $elem.getBoundingClientRect().top - _startFix );
                this.fxItems[elem].end = Math.floor( window.scrollY + $elem.getBoundingClientRect().top + $elem.offsetHeight );
                this.fxItems[elem].objHeight = $elem.offsetHeight;
            }
            if (this.fxItems[elem].fx==='bga') {
                this.fxItems[elem].bgHeight  = ($elem.dataset.filter) ?
                    $elem.querySelector( '#'+$elem.dataset.filter ).offsetHeight - this.fxItems[elem].objHeight:
                    $elem.children[0].offsetHeight - this.fxItems[elem].objHeight;
            }
        }
        this.#dHeight = document.body.offsetHeight;
    }

    #scrollEvent = ()=>{
        if (this.#scrollTick === false) return;

        this.#scrollTick = false;
        for (let elem in this.fxItems) {

            const start = this.fxItems[elem].start; //이벤트 시작점
            const end = this.fxItems[elem].end; //이벤트 종료점
            const _fx = this.fxItems[elem].fx;

            if (window.scrollY >= start && window.scrollY <= end) {
                if (this.fxItems[elem].activeStatus < 1) {
                    ////console.log(elem + ' 시작');
                    this.fxItems[elem].activeStatus = 1;
                }
                this[_fx](elem);
            } else {
                if ( window.scrollY <= start && this.fxItems[elem].activeStatus !== 0) {
                    this.fxItems[elem].activeStatus = 0;
                    ////console.log(elem + ' UP');
                    this[_fx](elem, 'up');
                } else if ( window.scrollY >= end && this.fxItems[elem].activeStatus !== -1) {
                    this.fxItems[elem].activeStatus = -1;
                    ////console.log(elem + ' DOWN');
                    this[_fx](elem, 'down');
                }
            }
        }
        this.#scrollTick = true;
    }

    #heightMonitor = ()=>{
        setInterval(()=>{
            if ( this.#dHeight !== document.body.offsetHeight ) {
                this.#dHeight = document.body.offsetHeight;
                this.setup();
            }
        },1500);
    }

    #deleteFx = (elem)=>{
        delete this.objs[elem];
        delete this.fxItems[elem];
    }

    #error = (elem, _type='')=>{
        let _str = '';
        switch (_type) {
            case 'fx' :
                _str = `${this.objs[elem]} 는 사용할 수 없습니다.`;
                break;
            case 'element' :
                _str = '요소가 존재하지 않거나 id가 중복되는 요소가 있습니다.';
                break;
            case 'getMediaAPI' :
                const _platform = document.getElementById(elem).dataset.service;
                _str = `${_platform} 에 대한 API를 찾을 수 없습니다.`;
                break;
            case 'force' :
                const _force = [];
                for (let fx in this.fxInfo) {
                    if (this.fxInfo[fx].force===true) _force.push(fx);
                }
                _str = '강제실행 가능 이펙트는 다음과 같습니다.\n'+_force.join();
                break;
            default:
                _str = this.fxInfo[_type].error || '알 수 없는 오류 발생';
                break;
        }
        this.#deleteFx(elem);
        if (_str!=='') console.log(`%c#${elem} : ${_str}`,'color:#FF3A3A;background-color:#222222;font-size: 16px');
        this.help(_type);
    }

    help = (type='')=>{
        let _str = `< ${type} >\n`;
        if (this.fxInfo.hasOwnProperty(type)) {
            _str += this.fxInfo[type].desc+'\n';
            if (this.fxInfo[type].require) {
                _str += '태그 내 필수 속성: \n';
                for (let _req in this.fxInfo[type].require) {
                    _str += `data-${_req}="${this.fxInfo[type].require[_req]}"\n`;
                }
            }
            if (this.fxInfo[type].options) {
                _str += '태그 내 사용 가능한 속성: \n';
                for (let _op in this.fxInfo[type].options) {
                    _str += `data-${_op}="${this.fxInfo[type].options[_op]}"\n`;
                }
            }
        } else {
            _str = '사용 가능한 이펙트 목록 :\n' + Object.keys(this.fxInfo).join(', ')
        }
        console.log(_str);
        return type;
    }

    #getPercentage = (elem)=>{
        return ( (window.scrollY - this.fxItems[elem].start) / (this.#wHeight+this.fxItems[elem].objHeight)  ).toFixed(2) * 1;
    }

    //미디어 API 로드
    static #getMediaAPI = (api)=>{
        const mediaAPI = {
            'youtube' : 'https://www.youtube.com/iframe_api',
            'vimeo' : 'https://player.vimeo.com/api/player.js',
            'mix' : '',
        }
        const appendApi = (_api)=>{
            if ( ! document.getElementById(_api+'_api_appended') ) {
                let $script = document.createElement('script');
                $script.src = mediaAPI[api];
                $script.id = api+'_api_appendeds';
                document.body.append($script);
            }
        }
        if ( mediaAPI.hasOwnProperty(api) ) {
            if (api==='mix') {
                appendApi('youtube');
                appendApi('vimeo');
            } else {
                appendApi(api);
            }
            return true;
        } else {
            return false;
        }
    }

    //동영상 레이지로드, 자동제어
    mediaAutoPlay = (elem, event='')=>{
        const $elem = document.getElementById(elem);
        if (!document.getElementById(elem).dataset.active) document.getElementById(elem).dataset.active = '0';
        let _platform = $elem.dataset.service;

        const mvInit = (_initPlay)=>{
            let _tryCount = 0;
            let _code = $elem.dataset.code;

            if (_code.indexOf(',')>1 || _platform==='mix') {
                let _codeArr = _code.split(',');
                _code = _codeArr[ Math.floor(Math.random() * _codeArr.length) ];

                if (_platform==='mix') {
                    _codeArr = _code.split(':');
                    _code = _codeArr[1];
                    switch (_codeArr[0]) {
                        case 'Y': _platform = 'youtube'; $elem.dataset.service = 'youtube'; break;
                        case 'V': _platform = 'vimeo'; $elem.dataset.service = 'vimeo'; break;
                        default:
                            console.log('동영상 코드의 앞쪽에 Y: 혹은 V: 를 추가해야 합니다.');
                            return false;
                    }
                }
            }
            const _initTry = ()=>{
                try {
                    //mediaAutoPlay init
                    const $target = document.getElementById(elem+'fxWrap');
                    const $controller = document.createElement('button');
                    $controller.classList.add('controller');
                    $controller.style.position = 'absolute';
                    $controller.style.zIndex = '5';
                    $controller.style.cursor = 'pointer';
                    $controller.addEventListener('click', ()=>{ $controller.classList.toggle('active') });
                    switch (_platform) {
                        case 'vimeo' :
                            const options = {
                                url: "https://vimeo.com/" + _code,
                                autoplay: 1,
                                muted: 1,
                                background: 1
                            };
                            this.fxItems[elem].media = new Vimeo.Player($target, options);
                            /*
                            this.fxItems[elem].media.on('play', ()=>{
                                this.fxItems[elem].media.play();
                            });
                             */
                            $controller.addEventListener('click', ()=>{
                                $controller.classList.contains('active') ? this.fxItems[elem].media.setVolume(1) : this.fxItems[elem].media.setVolume(0);
                            });
                            if (_initPlay===false) {
                                this.fxItems[elem].media.pause();
                                $elem.dataset.paused = '1';
                            }
                            break;
                        case 'youtube' :
                            const YTplay = function(e) {
                                e.target.mute();
                                if (_initPlay===false) {
                                    $elem.dataset.paused = '1';
                                } else {
                                    e.target.playVideo();
                                }
                            };
                            this.fxItems[elem].media = new YT.Player($target, {
                                videoId: _code,
                                playerVars: {
                                    'autoplay': 0,
                                    'playsinline': 1,
                                    'loop': 1,
                                    'controls': 0,
                                    'fs': 0,
                                    'playlist': _code,
                                    'origin': document.location
                                },
                                events: {'onReady': YTplay}
                            });
                            $controller.addEventListener('click', ()=>{
                                $controller.classList.contains('active') ? this.fxItems[elem].media.unMute() : this.fxItems[elem].media.mute();
                            });
                            break;
                        default:
                            this.#error(elem, 'mediaAutoPlay');
                            return false;
                    }
                    $elem.append($controller);
                    $elem.getElementsByTagName('iframe')[0].style.width = '100%';
                    $elem.getElementsByTagName('iframe')[0].style.height = '100%';
                } catch (err) {
                    if (_tryCount >= this.mediaLoadTryMax) {
                        console.error(elem+' : 동영상 로드 시도 '+_tryCount+'회 초과');
                        clearTimeout(_initTry);
                        this.#error(elem,'mediaAutoPlay');
                        return;
                    }
                    _tryCount++;
                    setTimeout(_initTry,500);
                }
            }
            _initTry();
        }

        const mvControl = (ctrl)=>{
            try {
                if (ctrl==='pause') { //일시정지
                    switch (_platform) {
                        case 'vimeo': this.fxItems[elem].media.pause(); break;
                        case 'youtube': this.fxItems[elem].media.pauseVideo(); break;
                    }
                    $elem.dataset.paused = '1';
                } else if (ctrl==='resume') { //재생
                    switch (_platform) {
                        case 'vimeo': this.fxItems[elem].media.play(); break;
                        case 'youtube': this.fxItems[elem].media.playVideo(); break;
                    }
                    $elem.dataset.paused = '0';
                }
            } catch(err) {}
        }

        if ($elem.dataset.active !== '1' && !this.#lazyItems.includes(elem)) {
            $elem.dataset.active = '1';
            mvInit(event === '');
        }

        switch(event) {
            case 'up':
            case 'down':
                if ( $elem.dataset.active === '1' && $elem.dataset.paused !== '1' ) {
                    mvControl('pause');
                }
                break;
            default:
                if ( $elem.dataset.active !== '1') {
                    $elem.dataset.active = '1';
                    mvInit(true);
                }
                if ( $elem.dataset.active === '1' && $elem.dataset.paused === '1') {
                    mvControl('resume');
                }
        }

    }

    //이미지 레이지 로드
    imgLazyLoad = (elem, event='')=>{
        if (event!=='') return;
        if (this.fxItems[elem].activeStatus===2) return;

        this.fxItems[elem].activeStatus = 2;
        const _alt =  (document.getElementById(elem).dataset.alt) ? document.getElementById(elem).dataset.alt : '';
        document.getElementById(elem).innerHTML = `<img src="${document.getElementById(elem).dataset.url}" alt="${_alt}">`;
        const $img = document.getElementById(elem).getElementsByTagName('img')[0];
        $img.onerror = ()=>{
            this.#error(elem, 'imgLazyLoad');
            return false;
        }

        let _imgLoadRaf;
        const _imgLoadRafCallback = ()=>{
            _imgLoadRaf = requestAnimationFrame(_imgLoadRafCallback);
            if ($img.offsetHeight>0) {
                this.setup();
                this.#deleteFx(elem);
                cancelAnimationFrame(_imgLoadRaf);
            }
        }
        _imgLoadRafCallback();
    }

    //html 레이지 로드
    htmlLazyLoad = (elem, event='')=>{
        if (event!=='') return;
        if (this.fxItems[elem].activeStatus===2) return;

        this.fxItems[elem].activeStatus = 2;
        const $elem = document.getElementById(elem);
        const _url = $elem.dataset.url;
        if (!_url) {
            this.#error(elem, 'htmlLazyLoad');
            return false;
        }

        const xhr = new XMLHttpRequest();
        xhr.open('GET', _url);
        xhr.timeout = 2000;
        xhr.send();

        xhr.ontimeout = ()=>{
            console.error('Timeout');
            this.#error(elem, 'htmlLazyLoad');
        }

        xhr.onload = ()=>{
            if (xhr.status === 200) {
                const parser = new DOMParser();
                const _res = parser.parseFromString(xhr.responseText, "text/html");
                $elem.innerHTML = ($elem.dataset.filter) ? _res.getElementById( $elem.dataset.filter ).outerHTML : _res.outerHTML;

                this.setup();
                this.#deleteFx(elem);
            } else {
                this.#error(elem, 'htmlLazyLoad');
            }
        }

        xhr.onerror = ()=>{
            this.#error(elem, 'htmlLazyLoad');
        }
    }

    //scrollTop 일정 포인트 도달시 fixed 클래스 부여 (GNB 등)
    float = (elem, event='')=>{
        const $elem = document.getElementById(elem);
        switch (event) {
            case 'up':
                $elem.classList.remove('fixed','bottom');
                break;
            case 'down':
                $elem.classList.add('fixed','bottom');
                break;
            default:
                if ( ! $elem.classList.contains('fixed') ) $elem.classList.add('fixed');
                $elem.classList.remove('bottom');
        }
    }

    //백그라운드 패럴랙스
    bga = (elem, event='')=>{
        const $elem = document.getElementById(elem);
        const $bg = ($elem.dataset.filter) ? $elem.querySelector( '#'+$elem.dataset.filter ) : $elem.children[0];

        switch (event) {
            case 'up':
                $bg.style.top = 0;
                $bg.style.bottom = 'auto';
                break;
            case 'down':
                $bg.style.top = 'auto';
                $bg.style.bottom = 0;
                break;
            default:
                requestAnimationFrame(()=>{
                    const percentage = this.fxItems[elem].bgHeight * this.#getPercentage(elem);
                    $bg.style.top = '-'+percentage+'px';
                    $bg.style.bottom = 'auto';
                });
        }
    }

    //active 클래스 부여
    active = (elem, event='')=>{
        if (event!=='') {
            document.getElementById(elem).classList.remove('active');
        } else {
            if (this.fxItems[elem].activeStatus===2) return;
            this.fxItems[elem].activeStatus = 2;
            document.getElementById(elem).classList.add('active');
            if (document.getElementById(elem).dataset.norepeat) this.#deleteFx(elem);
        }
    }

    //자식요소들에 순차적으로 active 클래스 부여
    chainActive = (elem, event='')=>{
        if (this.fxItems[elem].activeStatus===2) return;

        const $elem = document.getElementById(elem);
        const $children = ( $elem.dataset.filter ) ? $elem.getElementsByClassName($elem.dataset.filter) : $elem.children;

        if (event!=='') {
            for (let i=0; i<$children.length; i++) {
                $children[i].classList.remove('active');
            }
            return;
        }

        this.fxItems[elem].activeStatus = 2;
        const _speed = $elem.dataset.speed || 300;
        let _actTimeout = [];
        const _addClass = (c)=>{
            if (this.fxItems[elem].activeStatus !== 2) {
                for (let i=0; i<_actTimeout.length; i++) {
                    clearTimeout(_actTimeout[i]);
                    $children[i].classList.remove('active');
                }
            } else {
                $children[c].classList.add('active');
            }
        }
        for (let i=0; i<$children.length; i++) {
            _actTimeout[i] = setTimeout(()=>{ _addClass(i) }, _speed*i);
            if (i+1===$children.length && $elem.dataset.norepeat==='true') {
                setTimeout(()=>{ this.#deleteFx(elem); }, _speed*(i+1));
            }
        }
    }

    //카운터
    counter = (elem, event='')=>{
        if (event!=='') return;
        if (this.fxItems[elem].activeStatus===2) return;

        this.fxItems[elem].activeStatus = 2;
        const $items = document.getElementById(elem).querySelectorAll('[data-num]');
        const _speed = document.getElementById(elem).dataset.speed || 3000;

        const numFormat = (_n)=>{
            return _n.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
        }

        let _ret = [];
        let _counterTimeout = [];
        for (let i=0; i<$items.length; i++) {
            const _max = parseFloat( $items[i].dataset.num );
            const _increment = _max / (_speed/100) || 1;
            const _point = _max !== Math.floor(_max) ? ( (_max.toString().split('.'))[1] ).length : 0;

            _ret[i] = 0;
            const raise = ()=>{
                $items[i].innerHTML = numFormat( _ret[i].toFixed(_point) );
                _ret[i] += _increment;
                _counterTimeout[i] = setTimeout(raise, (_speed/100));
                if (_ret[i] >= _max) {
                    clearTimeout(_counterTimeout[i]);
                    $items[i].innerHTML = numFormat( _max );
                }
                if (this.fxItems[elem].activeStatus !== 2) {
                    clearTimeout(_counterTimeout[i]);
                }
            }
            raise();
        }
    }

    //타자기 효과
    typewrite = (elem, event='')=>{
        if (event!=='') return;
        if (this.fxItems[elem].activeStatus===2) return;
        this.fxItems[elem].activeStatus = 2;

        let _typeTimeout = [];
        const $elem = document.getElementById(elem);

        $elem.innerText = '';
        const _str = $elem.dataset.str;
        const _strArr = _str.split('');
        const _speed = $elem.dataset.speed || 100;

        const _type = (c)=>{
            if (this.fxItems[elem].activeStatus !== 2) {
                for (let i=0; i<_typeTimeout.length; i++) clearTimeout(_typeTimeout[i]);
                $elem.innerText = '';
                return;
            }
            if (c===' ') {
                $elem.appendChild(document.createTextNode('\u00a0'))
            } else {
                $elem.innerText += c;
            }
        }

        for (let i=0; i<_strArr.length; i++) {
            _typeTimeout[i] = setTimeout(()=>{ _type(_strArr[i]) }, _speed*i);
            if (i+1===_strArr.length && $elem.dataset.norepeat==='true') {
                setTimeout(()=>{
                    this.#deleteFx(elem);
                    $elem.innerText = $elem.dataset.str;
                }, _speed*(i+1));
            }
        }
    }

    //마퀴
    #marqueeSetup = (elem)=>{
        const $wrapper = document.getElementById(elem+'sfxmq');
        const _itemWidth = Math.ceil( $wrapper.children[0].offsetWidth + 1);
        const _content = $wrapper.children[0].outerHTML;
        if ( ! this.fxItems[elem].mqBreak ) {
            $wrapper.innerHTML = '';
            $wrapper.style.width = '0';
        }
        let i=1;
        while ($wrapper.offsetWidth < document.getElementById(elem).offsetWidth+_itemWidth) {
            $wrapper.innerHTML += _content;
            $wrapper.style.width = (_itemWidth*i)+'px';
            i++;
        }
        this.fxItems[elem].mqBreak = _itemWidth;
    }
    marquee = (elem, event='')=>{
        if (event!=='') return;
        if (this.fxItems[elem].activeStatus===2) return;
        this.fxItems[elem].activeStatus = 2;

        //init
        if ( !this.fxItems[elem].mqBreak ) {
            this.#marqueeSetup(elem);
            window.addEventListener('resize',()=>{
                this.#marqueeSetup(elem);
            });
        }

        const $elem = document.getElementById(elem);
        const $child = document.getElementById(elem+'sfxmq');
        const _speed = $elem.dataset.speed/60 || 1;

        let _pos = _speed;
        let _mqRaf;
        const _mqRafCallback = ()=>{
            _mqRaf = requestAnimationFrame(_mqRafCallback);
            if (this.fxItems[elem].activeStatus !== 2) {
                cancelAnimationFrame(_mqRaf);
                $child.style.transform = `translateX(0px)`;
            } else {
                if (_pos >= this.fxItems[elem].mqBreak) _pos = _speed;
                $child.style.transform = `translateX(-${_pos}px)`;
                _pos += _speed;
            }
        }
        _mqRafCallback();

    }

    //바운스
    bounce = (elem, event='')=>{
        if (event!=='') return;
        if (this.fxItems[elem].activeStatus===2) return;
        this.fxItems[elem].activeStatus = 2;

        const $elem = document.getElementById(elem);
        const _speed = $elem.dataset.speed || 200;
        $elem.style.transition = _speed+'ms';
        $elem.style.transform='translateY(0)';

        let _bounceTimeout = [];
        const _bounceAct = (c)=>{
            if (this.fxItems[elem].activeStatus !== 2) {
                for (let i=0; i<5; i++) clearTimeout(_bounceTimeout[i]);
                clearInterval(_bounceInterval);
                $elem.style.transform='translateY(0)';
            } else {
                const _tr = (c%2===0) ? '0' : '10px';
                $elem.style.transform='translateY('+_tr+')';
            }
        }

        const _bounceInterval = setInterval(()=>{
            if (this.fxItems[elem].activeStatus !== 2) {
                clearInterval(_bounceInterval);
                for (let i=0; i<_bounceTimeout.length; i++) clearTimeout(_bounceTimeout[i]);
            } else {
                for (let i=0; i<5; i++) {
                    _bounceTimeout[i] = setTimeout(()=>{ _bounceAct(i) }, _speed*i);
                }
            }
        },_speed*8);
    }

    //페이드인
    fadeIn = (elem, event='')=>{
        const $elem = document.getElementById(elem);
        switch (event) {
            case 'up':
                $elem.style.opacity = 0;
                break;
            case 'down':
                $elem.style.opacity = 1;
                break;
            default:
                $elem.style.opacity = this.#getPercentage(elem);
        }
    }

    //페이드아웃
    fadeOut = (elem, event='')=>{
        const $elem = document.getElementById(elem);
        switch (event) {
            case 'up': $elem.style.opacity = 1; break;
            case 'down': $elem.style.opacity = 0; break;
            default:
                $elem.style.opacity = 1-(this.#getPercentage(elem));
        }
    }

    //스크롤 일시중단
    paused = (elem)=>{
        const $elem = document.getElementById(elem);
        clearTimeout(this.fxItems[elem].pausedTimer);
        $elem.classList.remove('active');

        this.fxItems[elem].pausedTimer = setTimeout(()=>{
            $elem.classList.add('active');
        },1000);
    }

    //일반실행
    forceFx = (elem, _fx)=>{
        if ( ! Object.keys(this.fxInfo).includes( _fx ) ) {
            this.#error(elem,'fx');
            return;
        } else if ( ! this.fxInfo[_fx].force || this.fxInfo[_fx].force !== true ) {
            this.#error(elem,'force');
            return;
        }
        this.fxItems[elem] = {};
        this.fxItems[elem].activeStatus = 1;
        this[_fx](elem);
    }

}

const scrFX = new scrollFxLK();
addScrFxItem = (elem='',fx='')=>{
    scrFX.objs[elem] = fx;
}
forceScrFx = (elem='',fx='')=>{
    scrFX.forceFx(elem, fx);
}

window.addEventListener('load',()=>{
    setTimeout(()=>{
        scrFX.init();
    },100)
})
