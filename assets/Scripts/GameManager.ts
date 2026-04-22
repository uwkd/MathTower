import { _decorator, Component, Node, Input, EventTouch, Vec3, UITransform, Label, tween, sys, AudioClip, AudioSource } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {
    @property(Node) player: Node = null;
    @property(Label) playerPowerTxt: Label = null;
    @property(Node) popupDownload: Node = null;
    @property(Node) btnDownload: Node = null;

    @property([Node]) monsters: Node[] = [];
    @property([Number]) monsterPowers: number[] = [];

    // === KHAI BÁO ÂM THANH ===
    @property(AudioSource) audioSource: AudioSource = null; 
    @property(AudioClip) bgm: AudioClip = null;       
    @property(AudioClip) sfxWin: AudioClip = null;      
    @property(AudioClip) sfxClick: AudioClip = null;  

    private startPos: Vec3 = new Vec3();
    private playerPower: number = 10;
    private isGameOver: boolean = false;

    start() {
        this.player.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
        this.player.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.player.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
        this.player.on(Input.EventType.TOUCH_CANCEL, this.onTouchEnd, this);

        if (this.btnDownload) {
            this.btnDownload.on(Input.EventType.TOUCH_END, this.onClickDownload, this);
        }

        if (this.audioSource && this.bgm) {
            this.audioSource.clip = this.bgm;
            this.audioSource.loop = true;
            this.audioSource.play();
        }
    }

    onTouchStart(event: EventTouch) {
        if (this.isGameOver) return;
        this.startPos = this.player.getPosition().clone();
    }

    onTouchMove(event: EventTouch) {
        if (this.isGameOver) return;
        let delta = event.getUIDelta();
        let pos = this.player.getPosition();
        this.player.setPosition(pos.x + delta.x, pos.y + delta.y, pos.z);
    }

    onTouchEnd(event: EventTouch) {
        if (this.isGameOver) return;

        let isHit = false;

        for (let i = 0; i < this.monsters.length; i++) {
            let monster = this.monsters[i];
            let mPower = this.monsterPowers[i];

            if (!monster || !monster.active) continue;

            let distance = Vec3.distance(this.player.worldPosition, monster.worldPosition);

            if (distance < 100) {
                isHit = true;

                if (this.playerPower >= mPower) {
                    if (this.audioSource && this.sfxWin) this.audioSource.playOneShot(this.sfxWin, 1.0);

                    monster.active = false;
                    this.playerPower += mPower;
                    this.playerPowerTxt.string = this.playerPower.toString();

                    let targetPos = monster.worldPosition;
                    let localTarget = new Vec3();
                    this.player.parent.getComponent(UITransform).convertToNodeSpaceAR(targetPos, localTarget);

                    tween(this.player)
                        .to(0.2, { position: localTarget })
                        .start();

                    if (this.playerPower > 997) {
                        this.isGameOver = true;
                        this.scheduleOnce(() => {
                            this.showPopup();
                        }, 1.0);
                    }

                } else {

                    this.isGameOver = true;
                    this.player.active = false;

                    this.scheduleOnce(() => {
                        this.showPopup();
                    }, 0.5);
                }
                break;
            }
        }

        if (!isHit && !this.isGameOver) {
            tween(this.player)
                .to(0.2, { position: this.startPos })
                .start();
        }
    }

    showPopup() {
        if (this.popupDownload) {
            this.popupDownload.active = true;

            if (this.btnDownload) {
                this.btnDownload.setScale(new Vec3(1, 1, 1));
                tween(this.btnDownload)
                    .to(0.4, { scale: new Vec3(1.1, 1.1, 1) })
                    .to(0.4, { scale: new Vec3(1, 1, 1) })
                    .union()
                    .repeatForever()
                    .start();
            }
        }
    }

    onClickDownload() {

        if (this.audioSource && this.sfxClick) this.audioSource.playOneShot(this.sfxClick, 1.0);

        let url = "https://play.google.com/store/apps/details?id=com.mobile.legends";
        sys.openURL(url);
    }
}