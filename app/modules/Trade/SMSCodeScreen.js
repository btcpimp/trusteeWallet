import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Animated, Dimensions, Image, StatusBar, View, Aler, Clipboard } from 'react-native'

import LottieView from 'lottie-react-native'

const { height: WINDOW_HEIGHT } = Dimensions.get('window')

import { WebView } from 'react-native-webview'
import { showModal } from '../../appstores/Actions/ModalActions'
import NavStore from '../../components/navigation/NavStore'
import axios from 'axios'

import { strings } from 'root/app/services/i18n'
import firebase from 'react-native-firebase'
import Log from '../../services/Log/Log'
import MarketingEvent from '../../services/Marketing/MarketingEvent'

import Navigation from '../../components/navigation/Navigation'

import config from '../../config/config'

let baseUrl, exchangeMode, apiEndpoints

class SMSCodeScreen extends Component {

    constructor() {
        super()
        this.state = {
            status: 'new',
            loaded: '',
            link: '',
            id: null,
            receiptPay: true,
            lastStep: true,
            scriptLoadEnd: '',
            progress: new Animated.Value(0),
            url: ''
        }
        this.webref = React.createRef()
    }

    componentWillMount() {
        exchangeMode = config.exchange.mode
        apiEndpoints = config.exchange.apiEndpoints

        baseUrl = exchangeMode === 'DEV' ? apiEndpoints.baseURLTest: apiEndpoints.baseURL
    }

    handleStartAnimation = () => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(this.state.progress, {
                    toValue: 1,
                    duration: 5000
                }),
                Animated.timing(this.state.progress, {
                    toValue: 0,
                    duration: 5000
                })
            ]),
            {
                iterations: 50
            }
        ).start()
    }

    async componentDidMount() {

        Log.log('Exchange.SMSCodeScreen.componentDidMount started')

        const {
            cardNumber,
            expirationDate,
            uniqueParams
        } = this.props.exchange

        const expirationDateTmp = typeof expirationDate != 'undefined' ? expirationDate.split('/') : null
        let easybitsCardNumber = typeof cardNumber != 'undefined' ?  cardNumber.match(/.{1,4}/g) : null
        let xPayCardNumber = typeof cardNumber != 'undefined' ?  cardNumber.match(/.{1,4}/g) : []
        xPayCardNumber = xPayCardNumber.join(' ')

        const phoneNumber = uniqueParams.phone

        const firstName = uniqueParams.firstName
        const lastName = uniqueParams.lastName

        const nameToPaste = firstName + ' ' + lastName

        this.setState({
            //     document.getElementById("pay_in_card_number").value = '${cardNumber}';
            // document.getElementById("pay_in_expires_at").value = '${expirationDate}';
            // var form = document.getElementsByTagName("form")[0];
            // document.getElementById(form.id).submit();
            scriptLoadEnd: `
            try {
                    function findAndReplace(searchText, replacement, searchNode) {
                        if (!searchText || typeof replacement === 'undefined') {
                            // Throw error here if you want...
                            return;
                        }
                        var regex = typeof searchText === 'string' ?
                                    new RegExp(searchText, 'g') : searchText,
                            childNodes = (searchNode || document.body).childNodes,
                            cnLength = childNodes.length,
                            excludes = 'html,head,style,title,link,meta,script,object,iframe';
                        while (cnLength--) {
                            var currentNode = childNodes[cnLength];
                            if (currentNode.nodeType === 1 &&
                                (excludes + ',').indexOf(currentNode.nodeName.toLowerCase() + ',') === -1) {
                                arguments.callee(searchText, replacement, currentNode);
                            }
                            if (currentNode.nodeType !== 3 || !regex.test(currentNode.data) ) {
                                continue;
                            }
                            currentNode.parentNode.innerHTML = '';
                        }
                    }
                    
                    setTimeout(() => {
                        findAndReplace('(kuna|Kuna|KUNA)', '')
                    }, 3000)
            
                     if((window.location.href).indexOf('pay.receipt-pay.com') !== -1){
                        document.getElementsByName("card_number")[0].value = '${cardNumber}';
                        document.getElementsByName("expire_date")[0].value = '${expirationDateTmp[0]} / ${expirationDateTmp[1]}';
                        //document.getElementsByName("cvv")[0].value = '${'000'}';
                        //var form = document.getElementsByTagName("form")[0];
                        //document.getElementById(form.id).submit();
                     }
                     
                     if((window.location.href).indexOf('easybits.io') !== -1){
                        setTimeout(function() {
                            var input1 = document.getElementById("pan1");
                            var input2 = document.getElementById("pan2");
                            var input3 = document.getElementById("pan3");
                            var input4 = document.getElementById("pan4");
                            var input5 = document.getElementById("month");
                            var input6 = document.getElementById("year");
                        
                   
                            input1.value = '${typeof easybitsCardNumber != null ? easybitsCardNumber[0].toString() : ''}';
                            input2.value = '${typeof easybitsCardNumber != null ? easybitsCardNumber[1].toString() : ''}';
                            input3.value = '${typeof easybitsCardNumber != null ? easybitsCardNumber[2].toString() : ''}';
                            input4.value = '${typeof easybitsCardNumber != null ? easybitsCardNumber[3].toString() : ''}';
                            input5.value = '${typeof expirationDateTmp != null ? expirationDateTmp[0].toString() : ''}';
                            input6.value = '${typeof expirationDateTmp != null ? expirationDateTmp[1].toString() : ''}';
                             
                            var ev = new Event('input');
                            input1.dispatchEvent(ev);
                            input2.dispatchEvent(ev);
                            input3.dispatchEvent(ev);
                            input4.dispatchEvent(ev);
                            input5.dispatchEvent(ev);
                            input6.dispatchEvent(ev);
                            
                        }, 5000)
                     }
                     
                    /*if((window.location.href).indexOf('mapi.xpay.com.ua') !== -1 && !((window.location.href).indexOf('/check') !== -1)){
                        document.getElementsByName("create[acc]")[0].value = 'Vadymvad@gmail.com';
                        
                        document.getElementById("xpayAgreed").checked = true;
                        
                        var form = document.getElementsByTagName("form")[0];
                        document.getElementById(form.id).submit();
                     }*/

                     if((window.location.href).includes('cardgate.paycore.io')){
                        
                     
                        var input1 = document.getElementById("card-number");
                        var input2 = document.getElementById("card-date");
                        
                        input1.value = '${xPayCardNumber.length ? xPayCardNumber.toString() : ''}';
                        input2.value = '${expirationDateTmp[0]} / ${expirationDateTmp[1]}';
                     
                        var ev = new Event('input');
                        input1.dispatchEvent(ev);
                        input2.dispatchEvent(ev);
                     }
                     
                      if((window.location.href).includes('mapi.xpay.com.ua')){
                        document.getElementById("hdr").remove()
                      
                        document.getElementsByName("create[n]")[0].value = '${xPayCardNumber}';
                        document.getElementsByName("create[m]")[0].value = '${expirationDateTmp[0]}';
                        document.getElementsByName("create[y]")[0].value = '${expirationDateTmp[1]}'; 
                        
                        var elem = document.querySelector(".btnGrp");
                        elem.removeChild(elem.firstElementChild)
                        
                        document.getElementById("create[a]").checked = true;
                        
                     }

                    if((window.location.href).includes('oplata.qiwi.com')){
                        localStorage.clear();
                    
                        setTimeout(function () {
                            
                            var inputQIWI = document.getElementById("PhoneForm-Input");
                            var btnQIWI = document.getElementById("PhoneForm-Submit");
                            
                            var nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
                            nativeInputValueSetter.call(inputQIWI, '${phoneNumber}');
                            
                            var ev2 = new Event('input', { bubbles: true});
                            inputQIWI.dispatchEvent(ev2);
                            
                            btnQIWI.click();
                            
                            setTimeout(() => {
                                var input1QIWI = document.getElementById("radio-PasscodeForm-SmsRadioButton");
                                input1QIWI.click();
                                typeof window != 'undefined' ? window.scrollTo( 0, 0 ) : null;
                            }, 4000)
                        }, 5000)
                    }
                    
                    if((window.location.href).includes('online.contact-sys.com/payment-form')){
                        setTimeout(function () {
                            
                            var htmlContactSys = document.getElementsByTagName("html")[0];
 
                            var input1ContactSys = document.getElementsByName("cardNumber")[0];
                            var input2ContactSys = document.getElementsByName("expireDate")[0];
                            var input3ContactSys = document.getElementsByName("offer")[0];
                            var input4ContactSys = document.getElementsByName("cardHolder")[0];
                            
                            var nativeInputValueSetterInput1ContactSys = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
                            nativeInputValueSetterInput1ContactSys.call(input1ContactSys, '${xPayCardNumber}');
                            
                            var nativeInputValueSetterInput2ContactSys = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
                            nativeInputValueSetterInput2ContactSys.call(input2ContactSys, '${expirationDate}');
                            
                            var nativeInputValueSetterInput4ContactSys = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
                            nativeInputValueSetterInput4ContactSys.call(input4ContactSys, '${nameToPaste}');
                            
                            var inputEventContactSys = new Event('input', { bubbles: true});
                            input1ContactSys.dispatchEvent(inputEventContactSys);
                            input2ContactSys.dispatchEvent(inputEventContactSys);
                            input4ContactSys.dispatchEvent(inputEventContactSys);
                          
                            input3ContactSys.click();
                            
                            
                            htmlContactSys.style = "height: auto;"
                            input4ContactSys.parentNode.style = "display: none;";
                            
                        }, 2000)
                    }

                     if((window.location.href).includes('sci.any.cash')){
                        setTimeout(function () {
                           window.open(document.getElementsByTagName("iframe")[0].src, '_self')
                        }, 5000)
                     }
                     
                     if((window.location.href).includes('pay.4bill.io/cards')){
                        document.getElementsByName("card_number")[0].value = '${cardNumber}';
                        document.getElementsByName("expire_date")[0].value = '${expirationDateTmp[0]} / ${expirationDateTmp[1]}';
                     }
                     
                     setTimeout(function() {
                        typeof window != 'undefined' ? window.scrollTo( 0, 0 ) : null;
                     }, 2000);
                 } catch(error) {
        
                    true;
                 }
     
            `,
            status: 'pending'
        })

        this.handleStartAnimation()

        Log.log('Exchange.SMSCodeScreen.componentDidMount created payin')


        let data = {
            link: this.props.exchange.link,
            id: this.props.exchange.id,
        }

        MarketingEvent.logEvent('exchange_main_screen_buy_goto', {link : data.link, id: data.id + ''})

        Log.log('Exchange.SMSCodeScreen.handleSubmit.BUY goto', data)
        this.setState(data)

        try {
            setTimeout(() => {
                if (!this.state.url.includes('pay.receipt-pay.com/cards') && !this.state.url.includes('mapi.xpay.com') && !this.state.url.includes('easybits.io') && !this.state.url.includes('kuna.io/')) {
                    if (this.state.receiptPay) {
                        this.setState({
                            receiptPay: false,
                            status: 'success'
                        })
                    }
                }
            }, 30000)
        } catch(e) {}
    }

    handleWebViewNavigationStateChange = async newNavState => {

        const { url } = newNavState
        if (!url) return

        this.setState({
            url
        })

        Log.log('Exchange.SMSCodeScreen.handleWebViewNavigationStateChange started', url)

        if ((url.includes('pay.receipt-pay.com/cards') && url != 'about:blank') || (url.includes('cardgate.paycore.io') && url != 'about:blank') || (url.includes('mapi.xpay.com') && url != 'about:blank') || (url.includes('easybits.io') && url != 'about:blank')) {
            setTimeout(() => {
                if (this.state.receiptPay) {
                    this.setState({
                        receiptPay: false,
                        status: 'success'
                    })
                }
            }, 10000)
        }

        if ((url.includes('kuna.io/') || url.includes('trustee.deals')) && url != 'about:blank' && this.state.lastStep) {

            this.handleStartAnimation()

            this.setState({
                status: 'pending',
                lastStep: false
            })

            NavStore.goNext('FinishScreen', {
                finishScreenParam: {
                    selectedCryptocurrency: this.props.exchange.selectedCryptocurrency
                }
            })

            // setTimeout(async () => {
            //     const { data: res } = await axios.post(`${baseUrl}/get-payin-status`, data)
            //
            //
            //     Log.log('Exchange.SMSCodeScreen.handleWebViewNavigationStateChange check', res.data)
            //
            //     if (res.data.status == 'failed') {
            //         NavStore.goNext('MainDataScreen')
            //
            //         // showModal({
            //         //     type: 'INFO_MODAL',
            //         //     icon: false,
            //         //     title: strings('modal.exchange.failed'),
            //         //     description: strings('modal.exchange.txCanceled')
            //         // }, () => {
            //         //     NavStore.goNext('MainDataScreen');
            //         // });
            //     } else {
            //         NavStore.goNext('MainDataScreen')
            //
            //         /*showModal({
            //             type: 'INFO_MODAL',
            //             icon: true,
            //             title: strings('modal.exchange.success'),
            //             description: strings('modal.exchange.txSuccess')
            //         }, () => {
            //             NavStore.goNext('MainDataScreen');
            //         });*/
            //     }
            // }, 5000)
        }
    }

    render() {
        firebase.analytics().setCurrentScreen('Exchange.SMSCodeScreen')
        Log.log(`Exchange.SMSCodeScreen is rendered`)

        const { scriptLoadEnd, status, link } = this.state

        return (
            <View style={{ ...styles.wrapper }}>
                <Navigation />
                <View style={styles.wrapper__content}>
                    {
                        status != 'success' ?
                            <View style={styles.img}>
                                <LottieView style={{
                                    width: 200,
                                    height: 200,
                                    marginTop: -50
                                }} source={require('../../assets/jsons/animations/loaderBlue.json')} progress={this.state.progress}/>
                            </View> : null
                    }
                    <WebView
                        ref={r => (this.webref = r)}
                        javaScriptEnabled={true}
                        onNavigationStateChange={this.handleWebViewNavigationStateChange}
                        source={{ uri: link }}
                        style={{ flex: 1, maxHeight: status != 'success' ? 0 : 10000 }}
                        onLoadEnd={() => this.webref.injectJavaScript(scriptLoadEnd)}
                        onMessage={event => {

                        }}
                        useWebKit={true}
                    />
                </View>
            </View>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        exchange: state.exchangeStore.data,
        settingsStore: state.settingsStore
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        dispatch
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SMSCodeScreen)

const styles = {
    wrapper: {
        flex: 1,
        height: WINDOW_HEIGHT,
        backgroundColor: '#fff'
    },
    wrapper__content: {
        flex: 1,

        position: 'relative',

        marginTop: 80
    },
    img: {
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: WINDOW_HEIGHT,
        zIndex: 2,
        backgroundColor: '#fff'
    },
    img__item: {
        width: 100,
        height: 100,
        marginTop: 100
    }
}
