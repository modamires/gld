export type TreasureKind='small'|'medium'|'large'|'gem';
export const treasures = {
 small:{value:100,radius:22,speed:340,width:46,height:39},
 medium:{value:250,radius:32,speed:250,width:72,height:60},
 large:{value:500,radius:43,speed:175,width:102,height:85},
 gem:{value:750,radius:29,speed:220,width:65,height:72}
};
export const levels=[
 {id:1,name:'معدن تازه‌کارها',tag:'یک شروع درخشان',target:1000,duration:90,swing:0.85,color:'#18dccb',difficulty:'آسان',
 items:[['small',340,240],['medium',650,280],['large',470,360],['small',190,365],['medium',810,410],['gem',275,535],['large',650,540],['small',475,590],['medium',105,520]],rocks:[[760,540]]},
 {id:2,name:'غار بلورین',tag:'کمی عمیق‌تر، کمی درخشان‌تر',target:1500,duration:90,swing:1.06,color:'#9e75ff',difficulty:'متوسط',
 items:[['small',580,235],['medium',260,320],['large',755,345],['gem',475,475],['medium',145,540],['large',650,590],['small',850,550],['gem',330,610],['small',700,230]],rocks:[[380,335],[620,420],[190,440]]},
 {id:3,name:'چالش طلایی',tag:'وقتِ درخشیدن توست',target:2000,duration:90,swing:1.3,color:'#ffd447',difficulty:'چالشی',
 items:[['medium',390,250],['small',650,235],['large',190,380],['gem',790,450],['large',440,480],['gem',610,600],['medium',270,590],['small',830,280],['gem',100,585]],rocks:[[530,310],[330,420],[690,460],[460,610]]}
] as const;
