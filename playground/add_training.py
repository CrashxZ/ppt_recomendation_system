import json,sys
D=json.load(open(sys.argv[1],encoding="utf-8")); T=json.load(open(sys.argv[2],encoding="utf-8"))
def ds(pts,per=12):
    if len(pts)<3: return pts
    gaps=sorted(b[0]-a[0] for a,b in zip(pts,pts[1:])); med=gaps[len(gaps)//2]
    blocks=[[pts[0]]]
    for a,b in zip(pts,pts[1:]):
        if b[0]-a[0]>5*med: blocks.append([])
        blocks[-1].append(b)
    out=[]
    for bl in blocks:
        if out: out.append(None)
        if len(bl)<=per: out+=bl; continue
        k=len(bl)/per
        for j in range(per):
            g=bl[int(j*k):max(int((j+1)*k),int(j*k)+1)]
            out.append([round(sum(x[0] for x in g)/len(g)),float(f"{sum(x[1] for x in g)/len(g):.4g}")])
        out[-1]=bl[-1]
    return out
def _old(pts,n=160):
    if len(pts)<=n: return pts
    lo,hi=pts[0][0],pts[-1][0]; out=[]; b={}
    w=(hi-lo)/n
    for s,v in pts: b.setdefault(int((s-lo)/w),[]).append((s,v))
    for k in sorted(b): g=b[k]; out.append([round(sum(x[0] for x in g)/len(g)),float(f"{sum(x[1] for x in g)/len(g):.4g}")])
    return out
runs={}
for r in T['runs']:
    if r['id'] not in ('9gtyuhc3','fwitybpv'): continue
    K=r['keys']; cl=[]
    for i in range(10):
        c=K.get(f'client_{i}') or K.get(f'client_{i}/total_loss'); cl.append(ds(c))
    note={'fl':"W&B run 9gtyuhc3 (battraj-federated-no-behavior), 12 rounds × 10 clients. Clients train one after another within each round, so each client's line has gaps while the others train.",
          'tappfl':"W&B run fwitybpv (tappfl-battraj), 12 rounds × 10 clients. Client loss is the total TAPPFL loss (utility + λ·privacy), which goes below zero because the privacy term is negative."}[r['model']]
    runs[r['model']]=dict(name=r['name'],clients=cl,global_=None,**{'global':K['global']},note=note,x_label='step',log=(r['model']=='fl'))
    runs[r['model']].pop('global_')
D['train_clients']={'runs':runs}
D['training_summary']='Training loss per client, recorded live in W&B'
json.dump(D,open(sys.argv[3],'w',encoding='utf-8'),separators=(',',':'))
print({k:(sum(len(c) for c in v['clients']),len(v['global'])) for k,v in runs.items()}, len(json.dumps(D))/1e3,'KB')
