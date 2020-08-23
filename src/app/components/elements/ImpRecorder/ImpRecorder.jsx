import React, { Component } from 'react';
import { getData } from "./getip";
import { getBrowserName } from "./general";
import Replacer from "./functions";
import './style.css';
require("isomorphic-fetch");

class ImpRecorder extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            curIdx: 0,
            locked: false,
            dotHovering:false,
            demographics: null,
            ads: null,
            items: null,
            items1: null,
            insert: false
        };
        this.renderFrame = this.renderFrame.bind(this);
        this.rotate = this.rotate.bind(this);
    }
    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
          let j = Math.floor(Math.random() * (i + 1));
          [array[i], array[j]] = [array[j], array[i]];
        }
    }
    render() {
        const props = this.props,
            state = this.state,
            length = this.state.items===null?0:this.state.items.length,
            classPref = props.classPref;
        return (
            <div className={"Ads-rotator"}>
                <ul className={classPref + "-frames"}>
                { this.state.items===null?null:this.state.items.map(this.renderFrame) }
                </ul>
            </div>
            );
    }
    renderFrame(item, idx) {
        let props = this.props,
            classPref = props.classPref,
            onShow = this.state.curIdx;
          
        return (
            <li
                className={(onShow===idx?"Show_banner":"Hide_banner")}
            >
                <a onClick={() => (this.onItemClick(item))} href={item.href}>
                <img src={item.imgSrc} draggable="false" /> 
                </a>
            </li>
            );
    }
    onItemClick(item){
        const currentADD = item;//this.props.items[this.state.curIdx];
        console.log(currentADD)
        if(!document.hidden){

            fetch('https://graphql.voilk.com/graphql', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: 'mutation {generate_token {result}}' }),
            })
            .then(res => res.json())
            .then(res => {

            if(res.data.generate_token!==null)
            {
                let tc = res.data.generate_token.result;
                tc = Replacer.replace_array(tc);

                fetch('https://graphql.voilk.com/graphql', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ query: '{ record_click (username: "'+currentADD.username+'", advert_id: "'+currentADD.advert_id+'", click_data: "'+currentADD.impression+'", accesstoken: "'+tc+'") { nModified nMatched error nUpserted }}' }),
                })
                .then(resp => resp.json())
                .then(resp => {
                    
                    if(resp.data.record_click!==null)
                    {
                        console.log(resp.data.record_click.nModified)
                        
                        window.open(
                            currentADD.href,
                            '_blank' // <- This is what makes it open in a new window.
                        );
                        //window.location.href = currentADD.href;
                    }
                })
            }
          })    
        }

    }
    
    onDotClick(idx, e) {
        e.preventDefault();
        const state = this.state;
        if (state.curIdx !== idx) {
            this.setState({curIdx:idx,locked:true});
            setTimeout(() => {
                this.setState({ locked: false });
            }, this.props.lockTimeout);
        }
    }
    
    rotate() {
        this.setState({items: this.state.items1});
        if(this.state.items!==null)
        {
            const currentADD = this.state.items[this.state.curIdx];
            if(!document.hidden){
                fetch('https://graphql.voilk.com/graphql', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ query: 'mutation {generate_token {result}}' }),
                })
                .then(res => res.json())
                .then(res => {

                if(res.data.generate_token!==null)
                {
                    let tc = res.data.generate_token.result;
                    tc = Replacer.replace_array(tc);
                    fetch('https://graphql.voilk.com/graphql', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ query: '{ record_impression (username: "'+currentADD.username+'", advert_id: "'+currentADD.advert_id+'", impression: "'+currentADD.impression+'", accesstoken: "'+tc+'") { nModified nMatched error nUpserted }}' }),
                    })
                    .then(resp => resp.json())
                    .then(resp => {
                        
                        if(resp.data.record_impression!==null)
                        {
                            console.log(resp.data.record_impression.nModified)
                        }
                    })
                }})
            }
            if (this.state.dotHovering) {
                return;
            }
            this.setState(
                state => ({
                    curIdx: (state.curIdx + 1) % this.state.items.length
                }));}
            this.getads();
    }

    getads(){
        let data = getData();     
        data.then(d=> {
               d.ad_platform = navigator.platform;  
               d.ad_browser = getBrowserName();
               d.ad_url = window.location.href;
               d.created_at = Date.now();
               d.geoplugin_request = d.ip;
               fetch('https://graphql.voilk.com/graphql', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: '{ get_location_by_ip(ip: "'+d.ip+'"){ geoplugin_areaCode geoplugin_city geoplugin_continentCode geoplugin_continentName geoplugin_countryCode geoplugin_countryName geoplugin_currencyCode geoplugin_currencyConverter geoplugin_currencySymbol geoplugin_currencySymbol_UTF8 geoplugin_delay geoplugin_dmaCode geoplugin_euVATrate geoplugin_inEU geoplugin_latitude geoplugin_locationAccuracyRadius geoplugin_timezone geoplugin_status geoplugin_request geoplugin_regionName geoplugin_regionCode geoplugin_region geoplugin_longitude error  } }' }),
                })
                .then(res => res.json())
                .then(res => {
                    if(res.data.get_location_by_ip!==null||res.data.get_location_by_ip.error!==null)
                    {
                        d = res.data.get_location_by_ip;
                        d.ad_platform = navigator.platform;  
                        d.ad_browser = getBrowserName();
                        d.ad_url = window.location.href;
                        d.created_at = Date.now();
                        d.geoplugin_request = d.ip;
                        
                        var y = JSON.stringify(d);
                        let n = y.replace(/\"/g, "\\\"") 
                        this.setState({demographics: n})
                    }
                    else{
                        var y = JSON.stringify(d);
                        let n = y.replace(/\"/g, "\\\"") 
                        this.setState({demographics: n}) 
                    }
                })  
        })
        switch (this.props.adtype) {
            case "mini":
                fetch('https://graphql.voilk.com/graphql', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: '{ get_active_ads_mini { _id ad_link ad_width ad_target ad_height username }}' }),
                })
                .then(res => res.json())
                .then(res => {
                    if(res.data.get_active_ads_mini!==null)
                    {
                    this.setState({ads: res.data.get_active_ads_mini})
                    let items = this.state.ads.map((ad, key) => {return {imgSrc: ad.ad_link, href: ad.ad_target, impression: this.state.demographics, username: ad.username, advert_id: ad._id}});
                    this.setState({items1: items})  
                    //return res.data.get_active_ads;
                    }
                })
                break;
            case "small":
                fetch('https://graphql.voilk.com/graphql', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: '{ get_active_ads_small { _id ad_link ad_width ad_target ad_height username }}' }),
                })
                .then(res => res.json())
                .then(res => {
                    if(res.data.get_active_ads_small!==null)
                    {
                    this.setState({ads: res.data.get_active_ads_small})
                    let items = this.state.ads.map((ad, key) => {return {imgSrc: ad.ad_link, href: ad.ad_target, impression: this.state.demographics, username: ad.username, advert_id: ad._id}});
                    this.setState({items1: items})  
                    //return res.data.get_active_ads;
                    }
                })
                break;
            case "mediam":
                fetch('https://graphql.voilk.com/graphql', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: '{ get_active_ads_mediam { _id ad_link ad_width ad_target ad_height username }}' }),
                })
                .then(res => res.json())
                .then(res => {
                    if(res.data.get_active_ads_mediam!==null)
                    {
                    this.setState({ads: res.data.get_active_ads_mediam})
                    let items = this.state.ads.map((ad, key) => {return {imgSrc: ad.ad_link, href: ad.ad_target, impression: this.state.demographics, username: ad.username, advert_id: ad._id}});
                    this.setState({items1: items})  
                    //return res.data.get_active_ads;
                    }
                })
                break;
            case "large":
                fetch('https://graphql.voilk.com/graphql', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: '{ get_active_ads_large { _id ad_link ad_width ad_target ad_height username }}' }),
                })
                .then(res => res.json())
                .then(res => {
                    if(res.data.get_active_ads_large!==null)
                    {
                    this.setState({ads: res.data.get_active_ads_large})
                    let items = this.state.ads.map((ad, key) => {return {imgSrc: ad.ad_link, href: ad.ad_target, impression: this.state.demographics, username: ad.username, advert_id: ad._id}});
                    this.setState({items1: items})  
                    //return res.data.get_active_ads;
                    }
                })
            break;
            case "long":
                fetch('https://graphql.voilk.com/graphql', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: '{ get_active_ads_long { _id ad_link ad_width ad_target ad_height username }}' }),
                })
                .then(res => res.json())
                .then(res => {
                    if(res.data.get_active_ads_long!==null)
                    {
                    this.setState({ads: res.data.get_active_ads_long})
                    let items = this.state.ads.map((ad, key) => {return {imgSrc: ad.ad_link, href: ad.ad_target, impression: this.state.demographics, username: ad.username, advert_id: ad._id}});
                    this.setState({items1: items})  
                    //return res.data.get_active_ads;
                    }
                })
            break;
            case "wide":
                fetch('https://graphql.voilk.com/graphql', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: '{ get_active_ads_wide { _id ad_link ad_width ad_target ad_height username }}' }),
                })
                .then(res => res.json())
                .then(res => {
                    if(res.data.get_active_ads_wide!==null)
                    {
                    this.setState({ads: res.data.get_active_ads_wide})
                    let items = this.state.ads.map((ad, key) => {return {imgSrc: ad.ad_link, href: ad.ad_target, impression: this.state.demographics, username: ad.username, advert_id: ad._id}});
                    this.setState({items1: items})  
                    //return res.data.get_active_ads;
                    }
                })
            break;
            default:
                fetch('https://graphql.voilk.com/graphql', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ query: '{ get_active_ads_mediam { _id ad_link ad_width ad_target ad_height username }}' }),
                    })
                    .then(res => res.json())
                    .then(res => {
                        if(res.data.get_active_ads_mediam!==null)
                        {
                        this.setState({ads: res.data.get_active_ads_mediam})
                        let items = this.state.ads.map((ad, key) => {return {imgSrc: ad.ad_link, href: ad.ad_target, impression: this.state.demographics, username: ad.username, advert_id: ad._id}});
                        this.setState({items1: items})  
                        //return res.data.get_active_ads;
                        }
                    })
                break;
        }
    }

    componentDidMount() {
        this.rotateHandle = setInterval(this.rotate, 60000);
        let data = getData();     
        data.then(d=> {
               d.ad_platform = navigator.platform;  
               d.ad_browser = getBrowserName();
               d.ad_url = window.location.href;
               d.created_at = Date.now();
               delete d.geoplugin_credit;
               var y = JSON.stringify(d);
               let n = y.replace(/\"/g, "\\\"") 
               this.setState({demographics: n})
               this.getads.bind(this);  
        })
    }
    componentWillUnmount() {
        clearInterval(this.rotateHandle);
    }
    shouldComponentUpdate(nextp, nexts) {
        const state = this.state;
        // if (nexts.locked) {
        //     return !state.locked;
        // }
        // else {
        //     return true;
        // }
        return !nexts.locked || !state.locked;
    }
}

export default ImpRecorder;
