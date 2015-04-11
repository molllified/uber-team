//
//  ShifterView.h
//  UberTeam
//
//  Created by Jason Jiang on 4/10/15.
//
//

#import <UIKit/UIKit.h>
#import "ControlBlockView.h"

@interface ShifterView : ControlBlockView

@property (weak, nonatomic) IBOutlet UISlider *slider;
+ (ShifterView *)shifterCell;
@end
