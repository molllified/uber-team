//
//  ControlBlockView.h
//  UberTeam
//
//  Created by Jason Jiang on 4/10/15.
//
//

#import <UIKit/UIKit.h>
#import <Foundation/Foundation.h>

enum ControlBlockType : NSUInteger {
  GasPedal = 2,
  BrakePedal = 3,
  Shifter = 4,
  WindShieldWiper = 5,
  TurnSignal = 6,
  Volume = 7,
  Horn = 8
};

@interface ControlBlockView : UIView

@property (nonatomic, strong) NSString *type;
@property (nonatomic, strong) NSInteger *state;
- (void)broadcastStateChange;

@end
