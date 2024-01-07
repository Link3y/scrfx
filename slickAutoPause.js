class slickAutoPause extends scrollFxLK {

    /**
     2023 Lin.K (tabooo@naver.com, nihilin@gmail.com)
     슬릭 슬라이드 자동제어
     **/

    constructor() {
        super();
        this.fxInfo['slickPause'] = {
            desc: '슬릭 슬라이드 자동제어',
            error: ''
        }
    }

    slickPause(elem,event='') {
        if (event!=='') {
            slickAutoPause.slickPauseCall(elem,'slickPause');
        } else {
            if (this.fxItems[elem].activeStatus===2) return;
            this.fxItems[elem].activeStatus = 2;
            slickAutoPause.slickPauseCall(elem,'slickPlay');
        }
    }

    static slickPauseCall(elem,act) {
        try {
            //console.log(act);
            $('#'+elem).slick(act);
        } catch (err) {
            console.error(err);
        }
    }
}

addSlickPause = (elem='',fx='')=>{
    slickPause.objs[elem] = fx;
}

$(window).load(()=>{
    setTimeout(()=> {

        const $slide = $('.slick-slider');
        if ( $slide.length > 0 ) {
            const slickPause = new slickAutoPause();
            $slide.each((e, _this) => {
                if (_this.id) slickPause.objs[_this.id] = 'slickPause';
            });
            slickPause.init();
        }

    },100)
});