// RH2C: native MathML, preserving the workshop formulas and canonical claim limits.
// u is physical velocity; nu is physical diffusion; nu_M is mesh regularization.
import {esc} from '../core/html.js';
const mi=s=>`<mi>${s}</mi>`,mo=s=>`<mo>${s}</mo>`,mn=s=>`<mn>${s}</mn>`;
const row=(...s)=>`<mrow>${s.join('')}</mrow>`;
const sub=(x,s)=>`<msub>${x}${s}</msub>`,sup=(x,s)=>`<msup>${x}${s}</msup>`;
const both=(x,s,t)=>`<msubsup>${x}${s}${t}</msubsup>`;
const frac=(a,b)=>`<mfrac>${row(a)}${row(b)}</mfrac>`;
const par=s=>row(mo('('),s,mo(')'));
const math=(s,label)=>`<math xmlns="http://www.w3.org/1998/Math/MathML" display="block" aria-label="${esc(label)}">${row(s)}</math>`;
const dt=mi('Δ')+mi('t'),n=mi('n'),i=mi('i'),h=mi('h'),nu=mi('ν'),nuM=sub(nu,mi('M'));
const n1=row(n,mo('+'),mn('1')),im=row(i,mo('−'),mn('1')),ip=row(i,mo('+'),mn('1'));
const P=(index=i,time=n)=>both(mi('P'),index,time),phiN=both(mi('φ'),h,n),psi=sub(mi('ψ'),h);
const X=both(mi('X'),mn('1'),n),Xt=both('<mover><mi>X</mi><mo>~</mo></mover>',mn('1'),n);
const gamma=sup(mi('γ'),n),gammaT=sup('<mover><mi>γ</mi><mo>~</mo></mover>',n);
const rho=s=>sup(mi('ρ'),s),old=row(n,mo('−'),mn('1')),older=row(n,mo('−'),mn('2'));
const A=q=>both(mi('𝒜'),row(dt),par(mn(q)));
const l2=sup(mi('L'),mn('2')),ellInf=row(sup(mi('ℓ'),mo('∞')),par(l2)),ell2=row(sup(mi('ℓ'),mn('2')),par(l2));
const norm=(x,type)=>sub(row(mo('‖'),x,mo('‖')),type);
export const researchEquations={
 pde:math(sub(mo('∂'),mi('t'))+mi('φ')+mo('+')+mi('∇')+mo('·')+par(mi('u')+mi('φ'))+mo('−')+nu+mi('Δ')+mi('φ')+mo('=')+mn('0'),'Conservative convection diffusion equation'),
 departure:math(X+par(mi('x'))+mo('=')+mi('x')+mo('−')+dt+sup(mi('u'),n)+par(mi('x')),'Backward physical characteristic departure map'),
 pullback:math(par(both(mi('φ'),h,old)+mo('∘')+X)+gamma,'Jacobian weighted conservative pullback'),
 jacobian:math(gamma+mo('=')+mi('det')+par(frac(mo('∂')+X,mo('∂')+mi('x'))),'Characteristic Jacobian'),
 twoStep:math(Xt+par(mi('x'))+mo('=')+mi('x')+mo('−')+mn('2')+dt+sup(mi('u'),n)+par(mi('x')),'Two step characteristic map; its Jacobian is gamma tilde'),
 lgWeak:math(par(sub(mi('𝒜'),row(dt))+phiN+mo(',')+psi)+mo('+')+nu+par(mi('∇')+phiN+mo(',')+mi('∇')+psi)+mo('=')+mn('0'),'Mass preserving LG weak form: A delta t phi h n tested against psi h, plus physical diffusion, equals zero'),
 testSpace:math(mo('∀')+psi+mo('∈')+both(mi('Ψ'),h,n),'For every test function in the current finite element space'),
 bdf1:math(A('1')+rho(mn('1'))+mo('=')+frac(rho(mn('1'))+mo('−')+par(rho(mn('0'))+mo('∘')+both(mi('X'),mn('1'),mn('1')))+sup(mi('γ'),mn('1')),dt),'BDF1 startup conservative operator at the first step'),
 bdf2:math(A('2')+rho(n)+mo('=')+frac(mn('3')+rho(n)+mo('−')+mn('4')+par(rho(old)+mo('∘')+X)+gamma+mo('+')+par(rho(older)+mo('∘')+Xt)+gammaT,mn('2')+dt),'Second order conservative BDF2 operator for n greater than or equal to two'),
 continuousMesh:math(frac(mi('d')+sub(mi('P'),i),mi('d')+mi('t'))+par(mi('t'))+mo('=')+mi('u')+par(sub(mi('P'),i)+par(mi('t'))+mo(',')+mi('t'))+mo('+')+nuM+'<munder><mo>∑</mo>'+row(mi('K')+par(mi('t'))+mo('∋')+sub(mi('P'),i)+par(mi('t')))+'</munder>'+sub(row(mo('['),mi('∇'),sub(mi('ϕ'),i),par(mi('t')),mo(']')),row(mi('K')+par(mi('t')))),'Continuous LGMM interior node law: physical velocity plus the sum of adjacent P1 gradients weighted by mesh regularization'),
 continuousBoundary:math(sub(mi('P'),i)+par(mi('t'))+mo('≡')+both(mi('P'),i,mn('0'))+mo(',')+mi('i')+mo('∈')+sub(mi('ℐ'),mi('Γ')),'Fixed boundary vertices'),
 space:math(sub(mi('𝒯'),h)+par(mi('t'))+mo(',')+'<mspace width="1em"/>'+sub(mi('V'),h)+par(mi('t'))+mo('=')+mi('span')+mo('{')+sub(mi('ϕ'),i)+par(mi('t'))+mo('}'),'Supporting moving mesh and P1 space notation'),
 discreteUpdate:math(frac(P(i,n1)+mo('−')+P(),dt)+mo('=')+sup(mi('u'),n)+par(P())+mo('+')+nuM+frac(P(ip,n1)+mo('−')+mn('2')+P(i,n1)+mo('+')+P(im,n1),par(P()+mo('−')+P(im))+par(P(ip)+mo('−')+P())),'Semi implicit one dimensional interior node update with new time level spacing numerator and old time level spacing denominator'),
 discreteBoundary:math(P(mn('1'),n1)+mo('=')+mi('a')+mo(',')+'<mspace width="1em"/>'+P(sub(mi('N'),mi('p')),n1)+mo('=')+mi('b'),'Fixed one dimensional boundary nodes'),
 intervals:math(both(mi('K'),i,n)+mo('=')+mo('[')+P()+mo(',')+P(ip)+mo(']'),'Supporting current interval definition'),
 discreteSpace:math(both(mi('V'),h,n)+mo('=')+mi('span')+mo('{')+both(mi('ϕ'),i,n)+mo('}'),'Supporting current P1 finite element space'),
 meshValidity:math(P(mn('1'))+mo('&lt;')+P(mn('2'))+mo('&lt;')+mo('⋯')+mo('&lt;')+P(sub(mi('N'),mi('p'))),'Mesh validity: strict node ordering at every time level under the published condition'),
 mass:math(sub(mo('∫'),mi('Ω'))+phiN+mi('d')+mi('x')+mo('=')+sub(mo('∫'),mi('Ω'))+both(mi('φ'),h,mn('0'))+mi('d')+mi('x'),'Exact discrete total mass identity in the source free zero boundary flux case'),
 stability:math('<mtable columnalign="left" rowspacing="0.2em"><mtr><mtd>'+norm(sub(mi('φ'),h),ellInf)+mo('+')+'<msqrt>'+nu+'</msqrt>'+norm(mi('∇')+sub(mi('φ'),h),ell2)+'</mtd></mtr><mtr><mtd>'+mo('≤')+mi('C')+par(row(mo('‖'),both(mi('φ'),h,mn('0')),mo('‖'))+mo('+')+norm(mi('F'),row(sup(mi('ℓ'),mn('2')),par(sup(sub(mi('Ψ'),h),mo('′'))))))+'</mtd></mtr></mtable>','Published stability: L infinity L2 solution plus square root nu times l2 L2 gradient is bounded by initial data and forcing dual norm'),
 totalError:math(norm(sub(mi('φ'),h)+mo('−')+mi('φ'),ellInf)+mo('≤')+mi('C')+par(mi('Δ')+sup(mi('t'),mi('q'))+mo('+')+sup(h,mn('2'))),'Published total L2 error at first or second temporal order'),
 errorOrders:math(mi('q')+mo('=')+mn('1')+mo(',')+mn('2'),'First and second temporal order')
};
