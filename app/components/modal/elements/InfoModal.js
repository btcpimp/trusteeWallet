import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';

import Layout from '../../../components/elements/modal/Layout';
import Title from '../../../components/elements/modal/Title';
import Text from '../../../components/elements/modal/Text';
import Button from '../../../components/elements/modal/Button';
import Icon from '../../../components/elements/modal/Icon';
import ButtonWrap from '../../../components/elements/modal/ButtonWrap';
import { hideModal } from "../../../appstores/Actions/ModalActions";

export default class InfoModal extends Component {

    constructor(props){
        super(props);
    }

    handleHide = () => {
        const { callback } = this.props;

        hideModal();
        if(typeof callback != "undefined"){
            callback();
        }

    };

    render() {
        const { show } = this.props;
        const { icon, title, description, component, error} = this.props.data;
        if (typeof(error) !== 'undefined' && typeof (error.log) !== 'undefined') {
            // make visible for advanced users or devs @Misha? alert(error.log)
        }
        return (
            <Layout visible={show}>
                <View>
                    <Icon callback={this.handleHide} icon={`${ icon === true ? 'success' : icon === false ? 'fail' : icon === null ? 'warning' : '' }`} />
                    <Title style={styles.title}>
                        { title }
                    </Title>
                    <View style={{ paddingHorizontal: 15 }}>
                        <Text style={styles.text}>
                            { description }
                        </Text>
                    </View>
                    { typeof component != 'undefined' ? component() : null }
                    <ButtonWrap>
                        <Button onPress={this.handleHide}>
                            OK
                        </Button>
                    </ButtonWrap>
                </View>
            </Layout>
        )
    }
}

const styles = StyleSheet.create({
    title: {
        marginTop: 15
    },
    text: {
        marginTop: 5
    }
});
