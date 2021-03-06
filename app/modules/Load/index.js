import React, { Component } from "react"

import {
    Animated,
    Dimensions, Image, Platform,
    Text,
    View
} from 'react-native'
import GradientView from "../../components/elements/GradientView";

import firebase from "react-native-firebase"
import config from "../../config/config"
import { MaterialIndicator, UIActivityIndicator } from 'react-native-indicators'
import App from '../../appstores/Actions/App/App'
import NavStore from '../../components/navigation/NavStore'
import Log from '../../services/Log/Log'
import { connect } from 'react-redux'

const { height: WINDOW_HEIGHT } = Dimensions.get('window')

class LoadScreen extends Component {

    constructor(){
        super()
        this.state = {
            progress: new Animated.Value(0),
            status: ''
        };
    }

    componentDidMount(){
        try {
            this.statusTimeout = setTimeout(() => {
                this.setState({
                    status: App.initStatus + ' ' + App.initError
                })
            }, 10000)
        } catch (e) {}
    }

    componentWillUnmount() {
        try {
            clearTimeout(this.statusTimeout)
        } catch (e) {}
    }

    componentWillReceiveProps(props) {
        Log.log('LoadScreen is receiving props')

        if (props.data.init === true) { //this one is making "freezing"//&& this.props.data.init !== props.data.init) {
            if (+props.settings.data.lock_screen_status) {
                Log.log('InitScreen navigated to LockScreen')
                NavStore.reset('LockScreen')
            } else {
                Log.log('InitScreen navigated to DashboardStack')
                NavStore.reset('DashboardStack')
            }
        } else {
            Log.log('!!!!!!!!!!!!!!!!InitScreen will be here till DB inited')
        }
    }

    //
    // handleStartAnimation = () => {
    //     Animated.loop(
    //         Animated.sequence([
    //             Animated.timing(this.state.progress, {
    //                 toValue: 1,
    //                 duration: 5000,
    //             }),
    //             Animated.timing(this.state.progress, {
    //                 toValue: 0,
    //                 duration: 5000
    //             })
    //         ]),
    //         {
    //             iterations: 50
    //         }
    //     ).start()
    // };

    render() {
        firebase.analytics().setCurrentScreen('LoadScreen.index')
        return (
            <View style={styles.wrapper}>
                <View style={{ position: 'absolute', top: 20, left: 20 }}>
                    <Text style={{ marginTop: 40 }}>
                        { this.state.status }
                    </Text>
                </View>
                <View style={{ flex: 1, justifyContent: 'center' }}>
                    <Image
                        style={styles.image}
                        source={require('../../assets/images/logo.png')}
                    />
                    <View style={{ marginTop: -70, marginBottom: 60 }}>
                        { Platform.OS === 'ios' ? <UIActivityIndicator size={30} color='#3E3453' /> : <MaterialIndicator size={30} color='#3E3453' /> }
                    </View>
                    <View style={{ position: 'relative' }}>
                        <Text style={styles.appName__text} numberOfLines={1}>
                            TRUSTEE  WALLET
                        </Text>
                        <Text style={{
                            position: 'absolute',
                            top: 1,
                            left: 1,

                            width: '100%',

                            fontSize: 30,
                            fontFamily: 'SFUIDisplay-Bold',
                            color: '#3E3453',
                            textAlign: 'center',
                            zIndex: 1
                        }} numberOfLines={1}>
                            TRUSTEE  WALLET
                        </Text>
                        {
                            this.state.initError ?
                                <Text>{this.state.initError}</Text>
                                : null
                        }
                    </View>
                </View>
                <View style={{ marginTop: 'auto' }}>
                    <Text style={{ marginBottom: 10, opacity: .5, textAlign: 'center', fontFamily: 'SFUIDisplay-Regular', fontSize: 10, color: '#3E3453' }}>
                        { '#' + config.version.hash + ' | ' + config.version.code }
                    </Text>
                </View>
            </View>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        settings: state.settingsStore,
        data: state.mainStore
    }
}

export default connect(mapStateToProps, {})(LoadScreen)

const styles = {
    wrapper: {
        flex: 1,
        justifyContent: 'center',
        paddingLeft: 30,
        paddingRight: 30,
        backgroundColor: '#fff'
    },
    title: {
        textAlign: 'center',
        marginBottom: 10,
        fontSize: 34,
        fontFamily: 'SFUIDisplay-Semibold',
        color: '#404040'
    },
    image: {
        alignSelf: 'center',
        width: 148,
        height: 180,
        marginBottom: 147,
    },
    image__url: {
        path: require('../../assets/images/logo.png')
    },
    button: {
        marginBottom: 20
    },
    appName__text: {
        position: 'relative',
        fontSize: 30,
        fontFamily: 'SFUIDisplay-Bold',
        color: '#F24B93',
        textAlign: 'center',
        zIndex: 2
    }
};
