import json,sys
R=json.load(open(sys.argv[1],encoding="utf-8")); base=json.load(open('data_illustrative.json',encoding='utf-8'))
f=lambda pt:[round(pt[1],2),round(-pt[0],2)]
MAN={'keep_lane':'keep','change_left':'left','change_right':'right'}
scenes=[]
for sc in R['scenes']:
    nb=[]
    for n in sc.get('neighbors',[]):
        hist=[f(p) for p in n.get('history',[])]; fut=[f(p) for p in n.get('future_gt',[])]
        o={'pos':f(n['pos_t'])}
        if len(hist)==16:
            times=[-(15-i)*0.2 for i in range(16)]+[(i+1)*0.2 for i in range(len(fut))]
            o['path']=hist+fut; o['times']=[round(t,2) for t in times]
        nb.append(o)
    m=sc['models']
    scenes.append(dict(id=sc['test_index'],maneuver=MAN[sc['maneuver']],loc=sc['location'],veh_id=sc['vehicle_id'],frame=sc['frame'],
        challenging=sc['challenging'],speed=sc.get('ego_speed_mps'),hist=[f(p) for p in sc['history']],fut=[f(p) for p in sc['future_gt']],
        pred={'fl':[f(p) for p in m['A']['pred_mean']],'tappfl':[f(p) for p in m['B']['pred_mean']]},
        ref_err={'fl':[m['A']['ade'],m['A']['fde']],'tappfl':[m['B']['ade'],m['B']['fde']]},
        nbrs=nb,attack={'fl':[m['A']['attacker']['p_us101'],m['A']['attacker']['p_i80']],'tappfl':[m['B']['attacker']['p_us101'],m['B']['attacker']['p_i80']]}))
D=base; D['scenes']=scenes
ag=R['aggregate']
for k,K in (('fl','A'),('tappfl','B')):
    A_=ag[K]['attack']; h=A_.get('headline') or A_['reproduced_on_attack_test_split']; c=ag[K]['trajectory']['cartesian_m']
    D['models'][k].update(attack_acc=h['acc'],per_class=[h['acc_us101'],h['acc_i80']],rmse=[c['rmse'][f'{i}s'] for i in range(1,6)],ade=c['ade']['5s'],fde=c['fde']['5s'])
D['points']=[dict(label='Standard FL',model='fl',rmse5=D['models']['fl']['rmse'][4],attack=D['models']['fl']['attack_acc']),dict(label='TAPPFL λ=0.5',model='tappfl',rmse5=D['models']['tappfl']['rmse'][4],attack=D['models']['tappfl']['attack_acc'])]
D['baselines']['raw_history']=None
D['meta'].pop('scene_banner',None)
BATCHED='batch_size_note' not in R['meta']
D['meta']['badge']='Precomputed results · evaluated in batches of 512 cars' if BATCHED else 'Precomputed results · one car at a time'
D['meta']['utility_note']=('Errors are Cartesian meters on the full 1,505,756-sample test set, evaluated in random batches of 512 cars.' if BATCHED else D['meta']['utility_note'])
D['meta']['attack_test_n']=R['meta']['test_set']['attack_test_split_n']
g=R['grid']['samples']; ca=sum(x['A']['correct'] for x in g); cb=sum(x['B']['correct'] for x in g)
D['grid_note']=f"Majority guess means always answering I-80. In one fixed random draw of 100 test cars the attacker got {ca} (FL) and {cb} (TAPPFL) right, so single batches of 100 swing by several cars."
D['training']=[]  # training section now built by add_training.py
D['training_summary']='12 FL rounds · 12 TAPPFL rounds · 8 decoder rounds · 50 attacker epochs'
D['meta']['sources']=D['meta']['sources']+[f"Training curves: W&B runs 9gtyuhc3 (FL), fwitybpv (TAPPFL), pjyj9gkr (decoder retrain).",
 "Scenes: 36 NGSIM test cars, 12 per maneuver (6 per highway), seed 12; lane changes move at least 2.5 m sideways. Challenging = top 5% final error among lane changes."]
json.dump(D,open('data_real.json','w',encoding='utf-8'),separators=(',',':'))
# sanity: my ADE/FDE vs theirs
import math
for sc in scenes[:5]:
    for k in ('fl','tappfl'):
        e=[math.dist(a,b) for a,b in zip(sc['pred'][k],sc['fut'])]
        print(k, round(sum(e)/25,3), round(e[-1],3), sc['ref_err'][k])
print(len(json.dumps(D))/1e3,'KB')
