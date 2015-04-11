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
  int sliderValue sliderValue = lroundf(slider.value);
  [slider setValue:sliderValue animated:YES];
}

@end
