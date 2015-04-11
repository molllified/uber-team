//
//  ShifterView.m
//  UberTeam
//
//  Created by Jason Jiang on 4/10/15.
//
//

#import "ShifterView.h"

@implementation ShifterView

- (IBAction)sliderChanged:(id)sender
{
  long sliderValue = lroundf(self.slider.value);
  [self.slider setValue:sliderValue animated:YES];
  self.state = &(sliderValue);
  [self broadcastStateChange];
}

+ (ShifterView *)shifterView {
  ShifterView *s = [[[NSBundle mainBundle] loadNibNamed:@"ShifterCell" owner:self options:nil] objectAtIndex:0];
  s.type = Shifter;
  return s;
}

@end
