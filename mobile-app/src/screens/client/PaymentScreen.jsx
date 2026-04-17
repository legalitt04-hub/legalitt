import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  StatusBar, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { usePayment } from '../../hooks/usePayment';
import Button from '../../components/common/Button';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { formatINR } from '../../utils/helpers';

const METHODS = [
  { id:'upi',        label:'UPI',               desc:'GPay, PhonePe, Paytm, BHIM',    icon:'phone-portrait-outline' },
  { id:'card',       label:'Credit/Debit Card',  desc:'Visa, Mastercard, RuPay',        icon:'card-outline'           },
  { id:'netbanking', label:'Net Banking',         desc:'All major Indian banks',         icon:'business-outline'       },
  { id:'wallet',     label:'Wallet',              desc:'Mobikwik, Amazon Pay, Freecharge',icon:'wallet-outline'        },
];

const PaymentScreen = ({ route, navigation }) => {
  const { bookingId, amount, advocateName } = route.params || {};
  const { user } = useAuth();
  const { loading, error, orderId, initOrder, pay } = usePayment();
  const [selectedMethod, setSelectedMethod] = React.useState('upi');
  const [initing, setIniting] = React.useState(true);
  const [localOrderId, setLocalOrderId] = React.useState(null);
  const [keyId, setKeyId] = React.useState(null);

  useEffect(() => {
    const init = async () => {
      const result = await initOrder(bookingId);
      if (result) {
        setLocalOrderId(result.orderId);
        setKeyId(result.keyId);
      }
      setIniting(false);
    };
    if (bookingId) init();
    else setIniting(false);
  }, [bookingId]);

  const handlePay = async () => {
    const result = await pay({
      bookingId,
      orderId: localOrderId,
      amount,
      keyId,
      userName: user?.name,
      userEmail: user?.email,
      userPhone: user?.phone,
      description: `Consultation with ${advocateName}`,
    });
    if (result?.success) {
      navigation.replace('PaymentSuccess', {
        bookingId,
        chatId: result.chatId,
        advocateName,
      });
    }
  };

  if (initing) {
    return (
      <View style={s.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={s.initText}>Preparing payment...</Text>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{width:40,padding:4}}>
          <Ionicons name="chevron-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Payment</Text>
        <View style={{width:40}} />
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* Razorpay logo */}
        <View style={s.rzpBrand}>
          <Text style={s.rzpTxt}><Text style={{color:'#072654'}}>Razor</Text><Text style={{color:'#3395ff'}}>pay</Text></Text>
          <View style={{flexDirection:'row',alignItems:'center',gap:4,marginTop:4}}>
            <Ionicons name="lock-closed" size={12} color={COLORS.success} />
            <Text style={{fontSize:SIZES.caption,color:COLORS.textMuted}}>Secured by 256-bit SSL</Text>
          </View>
        </View>

        {/* Fee breakdown */}
        <View style={s.feeCard}>
          <View style={s.feeRow}>
            <Text style={s.feeLabel}>Consultation with</Text>
            <Text style={[s.feeLabel,{fontWeight:'700',color:COLORS.textPrimary}]}>{advocateName}</Text>
          </View>
          <View style={s.divider} />
          <View style={s.feeRow}>
            <Text style={s.feeLabel}>Consultation Fee</Text>
            <Text style={s.feeAmt}>{formatINR(amount)}/-</Text>
          </View>
          <View style={s.feeRow}>
            <Text style={s.feeLabel}>Platform Fee</Text>
            <Text style={{fontSize:SIZES.body,color:COLORS.textMuted}}>\u20b90/- (Free)</Text>
          </View>
          <View style={s.divider} />
          <View style={s.feeRow}>
            <Text style={[s.feeLabel,{fontWeight:'800',color:COLORS.textPrimary,fontSize:SIZES.body}]}>Total</Text>
            <Text style={[s.feeAmt,{fontSize:SIZES.subtitle,color:COLORS.textPrimary}]}>{formatINR(amount)}/-</Text>
          </View>
        </View>

        {/* Payment methods */}
        <Text style={s.methodsTitle}>Pay {formatINR(amount)}/-</Text>
        <View style={s.methodsCard}>
          {METHODS.map((m, i) => {
            const sel = selectedMethod === m.id;
            return (
              <React.Fragment key={m.id}>
                <TouchableOpacity
                  style={[s.methodRow, sel && s.methodRowSel]}
                  onPress={() => setSelectedMethod(m.id)}
                  activeOpacity={0.8}
                >
                  <View style={[s.methodIcon, sel && s.methodIconSel]}>
                    <Ionicons name={m.icon} size={20} color={sel ? COLORS.primary : COLORS.textSecondary} />
                  </View>
                  <View style={{flex:1}}>
                    <Text style={[s.methodLabel, sel && {color:COLORS.primary}]}>{m.label}</Text>
                    <Text style={s.methodDesc}>{m.desc}</Text>
                  </View>
                  <View style={[s.radio, sel && s.radioSel]}>
                    {sel && <View style={s.radioDot} />}
                  </View>
                </TouchableOpacity>
                {i < METHODS.length-1 && <View style={s.divider} />}
              </React.Fragment>
            );
          })}
        </View>

        {error && (
          <Text style={{color:COLORS.error,fontSize:SIZES.caption,textAlign:'center',marginBottom:SIZES.md}}>
            {error}
          </Text>
        )}

        {/* Trust row */}
        <View style={{flexDirection:'row',justifyContent:'center',gap:20}}>
          {[
            {icon:'shield-checkmark-outline',txt:'100% Secure'},
            {icon:'card-outline',txt:'No card stored'},
            {icon:'refresh-outline',txt:'Easy refund'},
          ].map((item,i) => (
            <View key={i} style={{flexDirection:'row',alignItems:'center',gap:4}}>
              <Ionicons name={item.icon} size={14} color={COLORS.textSecondary} />
              <Text style={{fontSize:SIZES.caption,color:COLORS.textSecondary}}>{item.txt}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={s.footer}>
        <Button
          title={loading ? 'Processing...' : `Pay ${formatINR(amount)}`}
          onPress={handlePay}
          loading={loading}
          disabled={!localOrderId || loading}
        />
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  container:    { flex:1, backgroundColor:COLORS.backgroundGrey },
  centered:     { flex:1, alignItems:'center', justifyContent:'center', backgroundColor:'#fff', gap:12 },
  initText:     { fontSize:SIZES.body, color:COLORS.textSecondary },
  header:       { flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:SIZES.screenPadding, paddingTop:52, paddingBottom:12, backgroundColor:'#fff', borderBottomWidth:1, borderBottomColor:COLORS.border },
  headerTitle:  { fontSize:SIZES.subtitle, fontWeight:'800', color:COLORS.textPrimary },
  content:      { padding:SIZES.screenPadding, paddingBottom:120 },
  rzpBrand:     { alignItems:'center', marginBottom:SIZES.xl },
  rzpTxt:       { fontSize:28, fontWeight:'800' },
  feeCard:      { backgroundColor:'#fff', borderRadius:SIZES.radiusLg, padding:SIZES.lg, ...SHADOWS.sm, marginBottom:SIZES.xl },
  feeRow:       { flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingVertical:6 },
  feeLabel:     { fontSize:SIZES.body, color:COLORS.textSecondary },
  feeAmt:       { fontSize:SIZES.body, fontWeight:'700', color:COLORS.primary },
  divider:      { height:1, backgroundColor:COLORS.borderLight, marginVertical:2 },
  methodsTitle: { fontSize:SIZES.body, fontWeight:'700', color:COLORS.textPrimary, marginBottom:SIZES.sm },
  methodsCard:  { backgroundColor:'#fff', borderRadius:SIZES.radiusLg, ...SHADOWS.sm, marginBottom:SIZES.xl, overflow:'hidden' },
  methodRow:    { flexDirection:'row', alignItems:'center', padding:SIZES.lg },
  methodRowSel: { backgroundColor:COLORS.primaryLight + '50' },
  methodIcon:   { width:40, height:40, borderRadius:20, backgroundColor:COLORS.backgroundGrey, alignItems:'center', justifyContent:'center', marginRight:SIZES.md },
  methodIconSel:{ backgroundColor:COLORS.primaryLight },
  methodLabel:  { fontSize:SIZES.body, fontWeight:'700', color:COLORS.textPrimary },
  methodDesc:   { fontSize:SIZES.caption, color:COLORS.textMuted, marginTop:2 },
  radio:        { width:22, height:22, borderRadius:11, borderWidth:2, borderColor:COLORS.border, alignItems:'center', justifyContent:'center' },
  radioSel:     { borderColor:COLORS.primary },
  radioDot:     { width:10, height:10, borderRadius:5, backgroundColor:COLORS.primary },
  footer:       { position:'absolute', bottom:0, left:0, right:0, backgroundColor:'#fff', padding:SIZES.screenPadding, paddingBottom:36, borderTopWidth:1, borderColor:COLORS.border },
});

export default PaymentScreen;
